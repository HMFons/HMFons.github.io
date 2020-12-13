import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { NgbDate } from '@ng-bootstrap/ng-bootstrap';
import { NgbdSortableHeader, SortEvent } from './sortable-header';
import { Track } from './Track';
const compare = (v1: string | number, v2: string | number) => v1 < v2 ? -1 : v1 > v2 ? 1 : 0;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit {
  parsedJson: Track[] = [];
  filteredJson: Track[] = [];
  pagedJson: Track[] = [];
  searchTerm: string = '';
  showBasicTable: boolean = true;
  showArtistTable: boolean;
  showTrackTable: boolean;
  showGroupedTable: boolean;
  grouped: boolean;
  page: number = 1;
  pageSize: number = 50;
  collectionSize: number;
  dateFrom: NgbDate;
  dateTo: NgbDate;

  @ViewChildren(NgbdSortableHeader) headers: QueryList<NgbdSortableHeader>;

  constructor() {

  }
  ngOnInit() {
  }

  public loadFiles(files: FileList) {
    var txt = "";
    if (files.length == 0) {
      txt = "Select one or more files.";
    } else {
      for (var i = 0; i < files.length; i++) {
        txt += "<br><strong>" + (i + 1) + ". file</strong><br>";
        var file = files[i];
        if ('name' in file) {
          txt += "name: " + file.name + "<br>";
        }
        if ('size' in file) {
          txt += "size: " + file.size + " bytes <br>";
        }
        this.readJsonFile(file);
      }
    }
    document.getElementById("demo").innerHTML = txt;
  }
  readJsonFile(jsonFile) {
    var reader = new FileReader();
    reader.readAsText(jsonFile, "UTF-8");
    reader.onload = () => {
      this.parsedJson = this.parsedJson.concat(JSON.parse(<string>reader.result));
      this.filteredJson = this.parsedJson;
      this.refreshJson();
    }
    reader.onerror = function (evt) {
      console.log('error reading file');
    }
  }
  createTable(json) {
    var table = "<table><thead><th>Artist</th><th>Track</th><th>Played at</th></thead><tbody>"
    json.sort((a, b) => (a.artistName.toLowerCase() > b.artistName.toLowerCase()) ? 1 : ((b.artistName.toLowerCase() > a.artistName.toLowerCase()) ? -1 : (a.trackName.toLowerCase() > b.trackName.toLowerCase()) ? 1 : ((b.trackName.toLowerCase() > a.trackName.toLowerCase()) ? -1 : 0)))
      .forEach(x => table += "<tr><td>" + x.artistName + "</td><td>" + x.trackName + "</td><td>" + x.endTime + "</td></tr>");
    table += "</tbody></table>";
    document.getElementById("table").innerHTML = table;

  }
  public createArtistGroupedTable() {
    this.grouped = true;
    this.showBasicTable = false;
    this.showArtistTable = true;
    var json = this.groupTable(this.filteredJson, 'artistName')
    console.log(json);
    var result = this.toArray(json);
    console.log(result);
    this.filteredJson = [];
    result.forEach(val => this.filteredJson.push({ artistName: val[0], amountPlayed: val[1].length, trackName: '', endTime: null }));
    this.refreshJson();
    this.showBasicTable = false;
    this.showArtistTable = true;
  }
  public createTrackGroupedTable() {
    var json = this.groupTable(this.parsedJson, 'trackName');
    throw "Not Implemented";
    var table = "<table><thead><th>Artist</th><th>Track</th><th>AmountPlayed</th></thead><tbody>"
    var result = this.toArray(json);
    result.forEach(artist => {
      table += " <tr><td>" + artist[0] + "</td><td></td><td>" + artist[1].length + "</td></tr>";
      artist[1].sort((a, b) => (a.trackName > b.trackName) ? 1 : ((b.trackName > a.trackName) ? -1 : 0)).forEach(track => {
        table += "<tr><td></td><td>" + track.trackName + "</td></tr>";
      })
    });
    table += "</tbody></table>";
    document.getElementById("table").innerHTML = table;
  }
  createGroupedTable(json) {
    var table = "<table><thead><th>Artist</th><th>Track</th><th>AmountPlayed</th></thead><tbody>"
    var result = this.toArray(json);
    result.forEach(artist => {
      table += " <tr><td>" + artist[0] + "</td><td>" + artist[1].length + "</td></tr>";
      artist[1].sort((a, b) => (a.trackName > b.trackName) ? 1 : ((b.trackName > a.trackName) ? -1 : 0)).forEach(track => {
        table += "<tr><td></td><td>" + track[0] + "</td><td>" + track[1].length + "</td></tr>";
      })
    });
    table += "</tbody></table>";
    document.getElementById("table").innerHTML = table;
  }
  groupTable(data: Track[], key: string): Track[] {
    var grouped: Track[] = data.reduce(function (storage, item) {
      var group = item[key];

      storage[group] = storage[group] || [];

      storage[group].push(item);
      return storage;
    }, []);
    return grouped
  }
  public groupBoth() {
    var groupedByArtist = this.groupTable(this.parsedJson, 'artistName');
    var artistArray = this.toArray(groupedByArtist);
    var groupedByBoth = [];
    artistArray.forEach(x => {
      groupedByBoth[x[0]] = this.toArray(this.groupTable(x[1], 'trackName'));
    });
    this.createGroupedTable(groupedByBoth);
  }
  toArray(json: Track[]) {
    return Object.keys(json).map((key) => [key, json[key]]);
  }
  public async loadData() {
    var allData: Track[] = [];
    for (let index = 0; index < 4; index++) {
      var data: Track[] = await fetch('../assets/StreamingHistory' + index + '.json', {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
      )
        .then(res => {
          if (!res.ok) {
            throw new Error("HTTP error " + res.status);
          }
          return res.json();
        });
      allData = allData.concat(data);
    }
    this.parsedJson = allData;
    this.filteredJson = allData;
    this.refreshJson();
  }

  public search() {
    console.log('filter');
    if (this.grouped) {
      this.filteredJson = this.filteredJson.filter(x => x.artistName.toLowerCase().includes(this.searchTerm.toLowerCase()) || x.trackName.toLowerCase().includes(this.searchTerm.toLowerCase()));
    } else {
      this.filteredJson = this.parsedJson.filter(x => x.artistName.toLowerCase().includes(this.searchTerm.toLowerCase()) || x.trackName.toLowerCase().includes(this.searchTerm.toLowerCase()));
    }
    this.filteredJson = this.filteredJson.filter(x => !this.dateFrom || new Date(x.endTime) >= new Date(this.dateFrom.year, this.dateFrom.month - 1, this.dateFrom.day));
    this.filteredJson = this.filteredJson.filter(x => !this.dateTo || new Date(x.endTime) <= new Date(this.dateTo.year, this.dateTo.month - 1, this.dateTo.day));
    this.refreshJson();
  }

  public refreshJson() {
    this.collectionSize = this.filteredJson.length
    this.pagedJson = this.filteredJson
      .map((track, i) => ({ id: i + 1, ...track }))
      .slice((this.page - 1) * this.pageSize, (this.page - 1) * this.pageSize + this.pageSize);
  }
  onSort({ column, direction }: SortEvent) {

    // resetting other headers
    this.headers.forEach(header => {
      if (header.sortable !== column) {
        header.direction = '';
      }
    });

    // sorting countries
    if (direction !== '' || column !== '') {
      this.filteredJson = [...this.filteredJson].sort((a, b) => {
        const res = compare(a[column], b[column]);
        return direction === 'asc' ? res : -res;
      });
      this.refreshJson();
    }
  }
}

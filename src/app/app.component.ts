import { Component, OnInit } from '@angular/core';
import { Track } from './Track';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit {
  parsedJson: Track[] = [];
  searchTerm: string = '';
  showBasicTable: boolean = true;
  showArtistTable: boolean;
  showTrackTable: boolean;
  showGroupedTable: boolean;

  constructor() {

  }
  ngOnInit() {
  }

  loadFiles() {
    var x = <HTMLInputElement>document.getElementById("myFile");
    var txt = "";
    if ('files' in x) {
      if (x.files.length == 0) {
        txt = "Select one or more files.";
      } else {
        for (var i = 0; i < x.files.length; i++) {
          txt += "<br><strong>" + (i + 1) + ". file</strong><br>";
          var file = x.files[i];
          if ('name' in file) {
            txt += "name: " + file.name + "<br>";
          }
          if ('size' in file) {
            txt += "size: " + file.size + " bytes <br>";
          }
          this.readJsonFile(file);
        }
      }
    }
    else {
      if ((<HTMLInputElement>x).value == "") {
        txt += "Select one or more files.";
      } else {
        txt += "The files property is not supported by your browser!";
        txt += "<br>The path of the selected file: " + (<HTMLInputElement>x).value; // If the browser does not support the files property, it will return the path of the selected file instead. 
      }
    }
    document.getElementById("demo").innerHTML = txt;
  }
  readJsonFile(jsonFile) {
    var reader = new FileReader();
    reader.readAsText(jsonFile, "UTF-8");
    reader.onload = function (evt) {
      console.log(JSON.parse(<string>evt.target.result));
    }
    reader.onerror = function (evt) {
      console.log('error reading file');
    }
    reader.readAsText(jsonFile);
  }
  createTable(json) {
    var table = "<table><thead><th>Artist</th><th>Track</th><th>Played at</th></thead><tbody>"
    json.sort((a, b) => (a.artistName.toLowerCase() > b.artistName.toLowerCase()) ? 1 : ((b.artistName.toLowerCase() > a.artistName.toLowerCase()) ? -1 : (a.trackName.toLowerCase() > b.trackName.toLowerCase()) ? 1 : ((b.trackName.toLowerCase() > a.trackName.toLowerCase()) ? -1 : 0)))
      .forEach(x => table += "<tr><td>" + x.artistName + "</td><td>" + x.trackName + "</td><td>" + x.endTime + "</td></tr>");
    table += "</tbody></table>";
    document.getElementById("table").innerHTML = table;

  }
  public createArtistGroupedTable() {
    this.showBasicTable = false;
    this.showArtistTable = true;
    var json = this.groupTable(this.parsedJson, 'artistName')
    var table = "<table><thead><th>Artist</th><th>Track</th><th>AmountPlayed</th></thead><tbody>"
    var result = this.toArray(json);
    result.forEach(artist => {
      table += " <tr><td>" + artist[0] + "</td><td>" + artist[1].length + "</td></tr>";
      artist[1].sort((a, b) => (a.trackName > b.trackName) ? 1 : ((b.trackName > a.trackName) ? -1 : 0)).forEach(track => {
        table += "<tr><td></td><td>" + track.trackName + "</td></tr>";
      })
    });
    table += "</tbody></table>";
    document.getElementById("table").innerHTML = table;
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
  groupTable(data, key) {
    var grouped = data.reduce(function (storage, item) {
      var group = item[key];

      storage[group] = storage[group] || [];

      storage[group].push(item);
      return storage;
    }, {});
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
  toArray(json) {
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
  }
  public onSort(event: Event) { console.log(event); }
}

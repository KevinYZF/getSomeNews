const fs = require('fs');
const child_process = require('child_process');
const path = require('path');

function deleteFolder(path) {
  var files = [];
  if (fs.existsSync(path)) {
    files = fs.readdirSync(path);
    files.forEach(function (file, index) {
      var curPath = path + "/" + file;
      if (fs.statSync(curPath).isDirectory()) { // recurse
        deleteFolder(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
}

const copy = (src, dest) => {
  if (!fs.existsSync(src)) return;
  const stat = fs.lstatSync(src);
  if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest);
    }
    const children = fs.readdirSync(src);
    children.forEach(ele => {
      copy(src + '/' + ele, dest + '/' + ele);
    });
  }
  if (stat.isFile()) {
    fs.copyFileSync(src, dest);
  }
}

deleteFolder('./public');
fs.mkdirSync('./public');

const execPath = path.resolve('./web');
const cp = child_process.spawn('npm.cmd', ['run', 'build'], {
  cwd: execPath
});

cp.stdout.on('data', data => console.log(data.toString()));

cp.on('close', () => {
  copy('./web/build', './public');
  fs.unlinkSync('./public/index.html');
  fs.unlinkSync('./views/index.ejs');
  copy('./web/build/index.html', './views/index.ejs');
});
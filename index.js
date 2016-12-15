'use strict';

let shell = require('electron').shell,
    path = require('path'),
    jsdom = require('jsdom'),
    currentTerm;

exports.init = ({config}) => {};

exports.setConfig = () => {};

function getPackageDetails(elm) {
    let nameElm = elm.querySelector('.name');

    return {
        key: nameElm.href,
        title: nameElm.textContent,
        description: elm.querySelector('.description').textContent,
        icon: path.resolve(__dirname, 'img', 'npm.png')
    };
}

exports.process = ({keyword, term, stream}) => {
    // If the term is empty, return no results.
    if (/^\s*$/.test(term)) {
        stream.end(undefined);
        return;
    }

    currentTerm = term;

    jsdom.env('https://www.npmjs.com/search?q=' +
        encodeURIComponent(term),
    (err, win) => {
        if (currentTerm !== term) {
            win.close();
            return;
        }

        let doc = win.document,
            pkgElms = doc.querySelectorAll('.package-details'),
            pkgs = [...pkgElms].map(getPackageDetails);

        pkgs.forEach((pkg) => {
            stream.write(pkg);
        });

        stream.end();
        win.close();
    });
};

exports.execute = ({key}) => {
    return new Promise((resolve, reject) => {
        if (/^https?\:\/\//.test(key)) {
            shell.openExternal(key);
            resolve();
        }
        else {
            reject();
        }
    });
};

exports.keyword = [
    'npm'
];

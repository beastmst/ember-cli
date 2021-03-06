'use strict';

// Runs `bower install` in cwd

var Promise = require('../ext/promise');
var chalk   = require('chalk');
var Task    = require('../models/task');

module.exports = Task.extend({
  // Options: Boolean verbose
  run: function(options) {
    var bower       = require('bower');
    var bowerConfig = require('bower-config');
    var ui = this.ui;

    ui.pleasantProgress.start(chalk.green('Installing browser packages via Bower'), chalk.green('.'));

    var config = bowerConfig.read();
    config.interactive = true;

    return new Promise(function(resolve, reject) {
        bower.commands.install([], { save: true }, config) // Packages, options, config
          .on('log', logBowerMessage)
          .on('prompt', ui.prompt.bind(ui))
          .on('error', reject)
          .on('end', resolve);
      })
      .finally(function() { ui.pleasantProgress.stop(); })
      .then(function() {
        ui.write(chalk.green('Installed browser packages via Bower.\n'));
      });

    function logBowerMessage(message) {
      if (message.level === 'conflict') {
        // e.g.
        //   conflict Unable to find suitable version for ember-data
        //     1) ember-data 1.0.0-beta.6
        //     2) ember-data ~1.0.0-beta.7
        ui.write('  ' + chalk.red('conflict') + ' ' + message.message + '\n');
        message.data.picks.forEach(function(pick, index) {
          ui.write('    ' + chalk.green((index + 1) + ')') + ' ' +
                   message.data.name + ' ' + pick.endpoint.target + '\n');
        });
      } else if (message.level === 'info' && options.verbose) {
        // e.g.
        //   cached git://example.com/some-package.git#1.0.0
        ui.write('  ' + chalk.green(message.id) + ' ' + message.message + '\n');
      }
    }
  }
});

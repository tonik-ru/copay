'use strict';

const builder = require('electron-builder');

builder
  .build({
    mac: ['mas', 'dmg'],
    linux: ['snap'],
    win: ['appx'],
    config: {
      appId: '*PACKAGENAMEIDDESKTOP*',
      productName: '*USERVISIBLENAME*',
      afterPack: './electron/afterPack.js',
      files: [
        './electron/main.js',
        './package.json',
        './www/**/*',
        './build',
        '!./node_modules/.cache/',
        '!./**/*.map'
      ],
      protocols: {
        name: 'URL protocol schemes',
        schemes: ['bitcoin', 'bitcoincash', 'bchtest', 'ethereum', '*NAME*']
      },
      mac: {
        category: 'public.app-category.finance',
        icon: 'resources/*NAME*/mac/app.icns',
        artifactName: '*USERVISIBLENAME*',
        darkModeSupport: false,
        identity: 'BitPay, Inc. (884JRH5R93)',
        extendInfo: {
          NSCameraUsageDescription:
            'Scan a Bitcoin Address directly to your Wallet and send funds to it'
        },
        target: ['mas']
      },
      mas: {
        artifactName: '*USERVISIBLENAME*.pkg',
        identity: 'BitPay, Inc. (884JRH5R93)',
        entitlements: './*PACKAGENAME*-entitlements.mas.plist',
        provisioningProfile: './*PACKAGENAME*-embedded.provisionprofile'
      },
      dmg: {
        artifactName: '*USERVISIBLENAME*.dmg',
        contents: [
          {
            x: 120,
            y: 180
          },
          {
            x: 380,
            y: 180,
            type: 'link',
            path: '/Applications'
          }
        ],
        background: 'resources/*NAME*/mac/dmg-background.tiff',
        icon: 'resources/*NAME*/mac/volume-icon.icns'
      },
      win: {
        target: ['appx'],
        icon: 'resources/*NAME*/windows/icon.ico',
        artifactName: '*USERVISIBLENAME*.appx'
      },
      appx: {
        identityName: '*WINDOWSSTOREIDENTITYNAME*',
        publisher: 'CN=F89609D1-EB3E-45FD-A58A-C2E3895FCE7B',
        publisherDisplayName: 'BitPay Inc.',
        applicationId: '*WINDOWSAPPLICATIONID*',
        displayName: '*WINDOWSSTOREDISPLAYNAME*',
        languages: ['en-US', 'es', 'fr']
      },
      linux: {
        target: ['snap'],
        artifactName: '*USERVISIBLENAME*-linux.snap'
      }
    }
  })
  .then(() => {
    // handle result
    console.log('Build OK!');
  })
  .catch(error => {
    // handle error
    console.log(error);
  });

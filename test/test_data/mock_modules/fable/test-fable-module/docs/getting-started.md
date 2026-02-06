# Getting Started

This guide walks you through setting up the test fable module.

## Prerequisites

- Node.js 14 or higher
- npm or yarn package manager

## Installation

Install the module using npm:

```bash
npm install test-fable-module --save
```

## Basic Usage

Create a new fable instance and configure services:

```javascript
const libFable = require('fable');

let tmpFable = new libFable({
    Product: 'MyApp',
    LogLevel: 3
});

tmpFable.log.info('Application started');
```

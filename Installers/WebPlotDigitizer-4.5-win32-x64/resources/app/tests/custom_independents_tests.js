QUnit.module("Custom independents tests");
QUnit.test("Linear XY axes", function(assert) {
    // Given linearly aligned axes
    let calib = new wpd.Calibration(2);
    calib.addPoint(0, 99, "0", "0"); // X1 = 0 at (0, 99)px
    calib.addPoint(99, 99, "100", "0"); // X2 = 100 at (99, 99)px
    calib.addPoint(0, 99, "0", "0"); // Y1 = 0 at (0, 99)px
    calib.addPoint(0, 0, "0", "10"); // Y2 = 10 at (0, 0)px

    let xyaxes = new wpd.XYAxes();
    xyaxes.calibrate(calib, false, false);

    // Given autodetection object with some pre-defined data using a function
    let dataFn = function(x) {
        return Math.sin(x) + 2;
    };
    let autodetection = new wpd.AutoDetectionData();
    autodetection.imageHeight = 100;
    autodetection.imageWidth = 100;
    autodetection.binaryData = new Set();

    for (let x = 0; x <= 100; x += 1) { // jump pixels as this algo can interpolate
        let y = dataFn(x);
        let pix = xyaxes.dataToPixel(x, y);
        let img_index = parseInt(pix.y, 10) * 100 + parseInt(pix.x, 10);
        autodetection.binaryData.add(img_index);
    }

    let algo = new wpd.CustomIndependents();
    algo.setParams({
        xvals: "[1, 10, 20]",
        ymin: 0,
        ymax: 10,
        curveWidth: 2,
        smoothing: 0,
    });

    let ds = new wpd.Dataset();
    algo.run(autodetection, ds, xyaxes);
    assert.equal(ds.getCount(), 3, "Simple linear XY");

    let totError = 0;
    for (let pi = 0; pi < ds.getCount(); pi++) {
        let px = ds.getPixel(pi);
        let data = xyaxes.pixelToData(px.x, px.y);
        totError += Math.abs(dataFn(data[0]) - data[1]);
    }
    totError /= ds.getCount();
    assert.ok(totError < 0.3, "Total error");
});

QUnit.test("Linear negative axes", function(assert) {
    // Given linearly aligned axes
    let calib = new wpd.Calibration(2);
    calib.addPoint(99, 0, "0", "0"); // X1 = 0 at (99,0)px
    calib.addPoint(0, 0, "-100", "0"); // X2 = -100 at (0, 0)px
    calib.addPoint(99, 0, "0", "0"); // Y1 = 0 at (99,0)px
    calib.addPoint(99, 99, "0", "-10"); // Y2 = -10 at (99, 99)px

    let xyaxes = new wpd.XYAxes();
    xyaxes.calibrate(calib, false, false);

    // Given autodetection object with some pre-defined data using a function
    let dataFn = function(x) {
        return Math.sin(x) - 3;
    };
    let autodetection = new wpd.AutoDetectionData();
    autodetection.imageHeight = 100;
    autodetection.imageWidth = 100;
    autodetection.binaryData = new Set();

    for (let x = -100; x <= 0; x += 1) { // jump pixels as this algo can interpolate
        let y = dataFn(x);
        let pix = xyaxes.dataToPixel(x, y);
        let img_index = parseInt(pix.y, 10) * 100 + parseInt(pix.x, 10);
        autodetection.binaryData.add(img_index);
    }

    let algo = new wpd.CustomIndependents();
    algo.setParams({
        xvals: "[-1, -10, -20]",
        ymin: -10,
        ymax: 0,
        curveWidth: 2,
        smoothing: 0,
    });

    let ds = new wpd.Dataset();
    algo.run(autodetection, ds, xyaxes);
    assert.equal(ds.getCount(), 3, "Negative linear XY");

    let totError = 0;
    for (let pi = 0; pi < ds.getCount(); pi++) {
        let px = ds.getPixel(pi);
        let data = xyaxes.pixelToData(px.x, px.y);
        totError += Math.abs(dataFn(data[0]) - data[1]);
    }
    totError /= ds.getCount();
    assert.ok(totError < 0.3, "Total error less than 0.3");
});

QUnit.test("Log scale X axes", function(assert) {
    // Given linearly aligned axes
    let calib = new wpd.Calibration(2);
    calib.addPoint(0, 99, "1e-5", "0"); // X1 = 1e-5 at (0, 99)px
    calib.addPoint(99, 99, "10", "0"); // X2 = 10 at (99, 99)px
    calib.addPoint(0, 99, "0", "0"); // Y1 = 0 at (0, 99)px
    calib.addPoint(0, 0, "0", "10"); // Y2 = 10 at (0, 0)px

    let xyaxes = new wpd.XYAxes();
    xyaxes.calibrate(calib, true, false);

    // Given autodetection object with some pre-defined data using a function
    let dataFn = function(x) {
        return 5;
    };
    let autodetection = new wpd.AutoDetectionData();
    autodetection.imageHeight = 100;
    autodetection.imageWidth = 100;
    autodetection.binaryData = new Set();

    for (let x = 1e-5; x <= 10; x *= 10) { // jump pixels as this algo can interpolate
        let y = dataFn(x);
        let pix = xyaxes.dataToPixel(x, y);
        let img_index = parseInt(pix.y, 10) * 100 + parseInt(pix.x, 10);
        autodetection.binaryData.add(img_index);
    }

    let algo = new wpd.CustomIndependents();
    algo.setParams({
        xvals: "[1e-5, 1e-4, 1e-2]",
        ymin: 0,
        ymax: 10,
        curveWidth: 2,
        smoothing: 0,
    });

    let ds = new wpd.Dataset();
    algo.run(autodetection, ds, xyaxes);
    assert.equal(ds.getCount(), 3, "log scale X axes");

    let totError = 0;
    for (let pi = 0; pi < ds.getCount(); pi++) {
        let px = ds.getPixel(pi);
        let data = xyaxes.pixelToData(px.x, px.y);
        totError += Math.abs(dataFn(data[0]) - data[1]);
    }
    totError /= ds.getCount();
    assert.ok(totError < 0.1, "Total error less than 0.1");
});

QUnit.test("Log scale X axes negative", function(assert) {
    // Given linearly aligned axes
    let calib = new wpd.Calibration(2);
    calib.addPoint(0, 99, "-1e-5", "0"); // X1 = 1e-5 at (0, 99)px
    calib.addPoint(99, 99, "-10", "0"); // X2 = 10 at (99, 99)px
    calib.addPoint(0, 99, "0", "0"); // Y1 = 0 at (0, 99)px
    calib.addPoint(0, 0, "0", "10"); // Y2 = 10 at (0, 0)px

    let xyaxes = new wpd.XYAxes();
    xyaxes.calibrate(calib, true, false);

    // Given autodetection object with some pre-defined data using a function
    let dataFn = function(x) {
        return 5;
    };
    let autodetection = new wpd.AutoDetectionData();
    autodetection.imageHeight = 100;
    autodetection.imageWidth = 100;
    autodetection.binaryData = new Set();

    for (let x = -1e-5; x >= -10; x *= 10) { // jump pixels as this algo can interpolate
        let y = dataFn(x);
        let pix = xyaxes.dataToPixel(x, y);
        let img_index = parseInt(pix.y, 10) * 100 + parseInt(pix.x, 10);
        autodetection.binaryData.add(img_index);
    }

    let algo = new wpd.CustomIndependents();
    algo.setParams({
        xvals: "[-1e-5, -1e-4, -1e-2]",
        ymin: 0,
        ymax: 10,
        curveWidth: 2,
        smoothing: 0,
    });

    let ds = new wpd.Dataset();
    algo.run(autodetection, ds, xyaxes);
    assert.equal(ds.getCount(), 3, "log scale X axes negative");

    let totError = 0;
    for (let pi = 0; pi < ds.getCount(); pi++) {
        let px = ds.getPixel(pi);
        let data = xyaxes.pixelToData(px.x, px.y);
        totError += Math.abs(dataFn(data[0]) - data[1]);
    }
    totError /= ds.getCount();
    assert.ok(totError < 0.1, "Total error less than 0.1");
});

QUnit.test("Log scale Y axes", function(assert) {
    // Given linearly aligned axes
    let calib = new wpd.Calibration(2);
    calib.addPoint(0, 99, "0", "0"); // X1 = 0 at (0, 99)px
    calib.addPoint(99, 99, "10", "0"); // X2 = 10 at (99, 99)px
    calib.addPoint(0, 99, "0", "1e-5"); // Y1 = 1e-5 at (0, 99)px
    calib.addPoint(0, 0, "0", "10"); // Y2 = 10 at (0, 0)px

    let xyaxes = new wpd.XYAxes();
    xyaxes.calibrate(calib, false, true);

    // Given autodetection object with some pre-defined data using a function
    let dataFn = function(x) {
        return 5;
    };

    let autodetection = new wpd.AutoDetectionData();
    autodetection.imageHeight = 100;
    autodetection.imageWidth = 100;
    autodetection.binaryData = new Set();

    for (let x = 0; x <= 10; x += 0.01) {
        let y = dataFn(x);
        let pix = xyaxes.dataToPixel(x, y);
        let img_index = parseInt(pix.y, 10) * 100 + parseInt(pix.x, 10);
        autodetection.binaryData.add(img_index);
    }

    let algo = new wpd.CustomIndependents();
    algo.setParams({
        xvals: "[1, 5, 8]",
        ymin: 1e-5,
        ymax: 10,
        curveWidth: 2,
        smoothing: 0,
    });

    let ds = new wpd.Dataset();
    algo.run(autodetection, ds, xyaxes);
    assert.equal(ds.getCount(), 3, "log scale Y axes");

    let totError = 0;
    for (let pi = 0; pi < ds.getCount(); pi++) {
        let px = ds.getPixel(pi);
        let data = xyaxes.pixelToData(px.x, px.y);
        totError += Math.abs(dataFn(data[0]) - data[1]);
    }
    totError /= ds.getCount();
    assert.ok(totError < 1, "Total error less than 1");
});

QUnit.test("Log scale Y axes negative", function(assert) {
    // Given linearly aligned axes
    let calib = new wpd.Calibration(2);
    calib.addPoint(0, 99, "0", "0"); // X1 = 0 at (0, 99)px
    calib.addPoint(99, 99, "10", "0"); // X2 = 10 at (99, 99)px
    calib.addPoint(0, 99, "0", "-1e-5"); // Y1 = -1e-5 at (0, 99)px
    calib.addPoint(0, 0, "0", "-10"); // Y2 = -10 at (0, 0)px

    let xyaxes = new wpd.XYAxes();
    xyaxes.calibrate(calib, false, true);

    // Given autodetection object with some pre-defined data using a function
    let dataFn = function(x) {
        return -5;
    };

    let autodetection = new wpd.AutoDetectionData();
    autodetection.imageHeight = 100;
    autodetection.imageWidth = 100;
    autodetection.binaryData = new Set();

    for (let x = 0; x <= 10; x += 0.01) {
        let y = dataFn(x);
        let pix = xyaxes.dataToPixel(x, y);
        let img_index = parseInt(pix.y, 10) * 100 + parseInt(pix.x, 10);
        autodetection.binaryData.add(img_index);
    }

    let algo = new wpd.CustomIndependents();
    algo.setParams({
        xvals: "[1, 5, 8]",
        ymin: -10,
        ymax: -1e-5,
        curveWidth: 2,
        smoothing: 0,
    });

    let ds = new wpd.Dataset();
    algo.run(autodetection, ds, xyaxes);
    assert.equal(ds.getCount(), 3, "log scale Y axes");

    let totError = 0;
    for (let pi = 0; pi < ds.getCount(); pi++) {
        let px = ds.getPixel(pi);
        let data = xyaxes.pixelToData(px.x, px.y);
        totError += Math.abs(dataFn(data[0]) - data[1]);
    }
    totError /= ds.getCount();
    assert.ok(totError < 1, "Total error less than 1");
});

QUnit.test("Dates axes", function(assert) {
    // dates are not supported right now!
    assert.ok(true);
});
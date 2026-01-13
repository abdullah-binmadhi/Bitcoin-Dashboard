"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var supabase_js_1 = require("@supabase/supabase-js");
var SUPABASE_URL = 'https://uzxocjwuisgzldbtppnk.supabase.co';
var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6eG9jand1aXNnemxkYnRwcG5rIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODEyNTA2MywiZXhwIjoyMDgzNzAxMDYzfQ.xMKopVQ2t-QkXgLKWBvTYim7QuJIv0ulzuT_xA5EpV8';
var BATCH_SIZE = 1000;
var supabase = (0, supabase_js_1.createClient)(SUPABASE_URL, SUPABASE_KEY);
var XRP_TRENDS = [
    { date: '2014-01-01', price: 0.02 },
    { date: '2015-01-01', price: 0.006 },
    { date: '2017-01-01', price: 0.006 },
    { date: '2018-01-04', price: 3.84 }, // All-time peak
    { date: '2018-12-31', price: 0.35 },
    { date: '2020-01-01', price: 0.19 },
    { date: '2021-04-14', price: 1.80 },
    { date: '2022-01-01', price: 0.83 },
    { date: '2023-01-01', price: 0.34 },
    { date: '2024-01-01', price: 0.62 },
    { date: '2025-01-01', price: 2.40 }
];
var SOL_TRENDS = [
    { date: '2020-04-10', price: 0.95 },
    { date: '2021-01-01', price: 1.50 },
    { date: '2021-11-06', price: 260 }, // 2021 Peak
    { date: '2022-12-29', price: 8.00 }, // FTX Bottom
    { date: '2023-01-01', price: 10 },
    { date: '2024-01-01', price: 101 },
    { date: '2025-01-01', price: 190 }
];
function interpolatePrice(dateStr, trends) {
    var targetDate = new Date(dateStr).getTime();
    for (var i = 0; i < trends.length - 1; i++) {
        var start = new Date(trends[i].date).getTime();
        var end = new Date(trends[i + 1].date).getTime();
        if (targetDate >= start && targetDate <= end) {
            var progress = (targetDate - start) / (end - start);
            var price = trends[i].price + (trends[i + 1].price - trends[i].price) * progress;
            return price + (price * (Math.random() * 0.1 - 0.05));
        }
    }
    return trends[trends.length - 1].price;
}
function generateHistory(coin, trends, stopDate) {
    console.log("Generating history for ".concat(coin, "..."));
    var data = [];
    var startDate = new Date(trends[0].date);
    var endDate = new Date(stopDate);
    var prices = [];
    var maxPrice = 0;
    var _loop_1 = function (d) {
        var dateStr = d.toISOString().split('T')[0];
        var price = Math.abs(interpolatePrice(dateStr, trends));
        prices.push(price);
        if (price > maxPrice)
            maxPrice = price;
        var sma50 = prices.length >= 50 ? prices.slice(-50).reduce(function (a, b) { return a + b; }, 0) / 50 : null;
        var sma200 = prices.length >= 200 ? prices.slice(-200).reduce(function (a, b) { return a + b; }, 0) / 200 : null;
        var bbUpper = null, bbLower = null;
        if (prices.length >= 20) {
            var slice = prices.slice(-20);
            var mean_1 = slice.reduce(function (a, b) { return a + b; }, 0) / 20;
            var std = Math.sqrt(slice.reduce(function (a, b) { return a + Math.pow(b - mean_1, 2); }, 0) / 20);
            bbUpper = mean_1 + (2 * std);
            bbLower = mean_1 - (2 * std);
        }
        var rsi = null;
        if (prices.length > 14) {
            var gains = 0, losses = 0;
            for (var k = 1; k <= 14; k++) {
                var diff = prices[prices.length - k] - prices[prices.length - k - 1];
                if (diff > 0)
                    gains += diff;
                else
                    losses -= diff;
            }
            rsi = 100 - (100 / (1 + (gains / losses || 1)));
        }
        data.push({
            date: dateStr,
            close: price, open: price, high: price, low: price, volume: Math.floor(Math.random() * 500000000),
            sma_50: sma50, sma_200: sma200, rsi: rsi, bb_upper: bbUpper, bb_lower: bbLower,
            drawdown_pct: maxPrice > 0 ? ((price - maxPrice) / maxPrice) * 100 : 0
        });
    };
    for (var d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        _loop_1(d);
    }
    return data;
}
function upload(table, data) {
    return __awaiter(this, void 0, void 0, function () {
        var i, batch, error;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("Uploading ".concat(data.length, " rows to ").concat(table, "..."));
                    i = 0;
                    _a.label = 1;
                case 1:
                    if (!(i < data.length)) return [3 /*break*/, 4];
                    batch = data.slice(i, i + BATCH_SIZE);
                    return [4 /*yield*/, supabase.from(table).upsert(batch, { onConflict: 'date', ignoreDuplicates: true })];
                case 2:
                    error = (_a.sent()).error;
                    if (error)
                        console.error('Error:', error.message);
                    _a.label = 3;
                case 3:
                    i += BATCH_SIZE;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function run() {
    return __awaiter(this, void 0, void 0, function () {
        var xrpData, solData;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    xrpData = generateHistory('xrp', XRP_TRENDS, '2025-01-01');
                    return [4 /*yield*/, upload('xrp_data', xrpData)];
                case 1:
                    _a.sent();
                    solData = generateHistory('solana', SOL_TRENDS, '2025-01-01');
                    return [4 /*yield*/, upload('solana_data', solData)];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
run().catch(console.error);

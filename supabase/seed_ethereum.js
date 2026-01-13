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
var fs = require("fs");
var path = require("path");
// Configuration
var SUPABASE_URL = process.env.SUPABASE_URL || 'https://uzxocjwuisgzldbtppnk.supabase.co';
var SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6eG9jand1aXNnemxkYnRwcG5rIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODEyNTA2MywiZXhwIjoyMDgzNzAxMDYzfQ.xMKopVQ2t-QkXgLKWBvTYim7QuJIv0ulzuT_xA5EpV8';
var CSV_PATH = path.join(__dirname, '../ethereum.csv');
var TABLE_NAME = 'ethereum_data';
var BATCH_SIZE = 500;
// Reuse calculation functions (In a real app, these would be shared)
function calculateSMA(prices, period) {
    if (prices.length < period)
        return null;
    var slice = prices.slice(-period);
    return slice.reduce(function (a, b) { return a + b; }, 0) / period;
}
function calculateRSI(prices, period) {
    if (period === void 0) { period = 14; }
    if (prices.length < period + 1)
        return null;
    var gains = 0;
    var losses = 0;
    for (var i = prices.length - period; i < prices.length; i++) {
        var diff = prices[i] - prices[i - 1];
        if (diff > 0)
            gains += diff;
        else
            losses -= diff;
    }
    var avgGain = gains / period;
    var avgLoss = losses / period;
    if (avgLoss === 0)
        return 100;
    var rs = avgGain / avgLoss;
    return 100 - 100 / (1 + rs);
}
function calculateBollingerBands(prices, period, stdDev) {
    if (period === void 0) { period = 20; }
    if (stdDev === void 0) { stdDev = 2; }
    if (prices.length < period)
        return { upper: null, lower: null };
    var slice = prices.slice(-period);
    var sma = slice.reduce(function (a, b) { return a + b; }, 0) / period;
    var variance = slice.reduce(function (a, b) { return a + Math.pow(b - sma, 2); }, 0) / period;
    var std = Math.sqrt(variance);
    return { upper: sma + stdDev * std, lower: sma - stdDev * std };
}
function parseCSV(csvContent) {
    var lines = csvContent.trim().split('\n');
    var headers = lines[0].split(',');
    return lines.slice(1).map(function (line) {
        var values = line.split(',');
        var row = {};
        headers.forEach(function (header, index) {
            var _a;
            row[header.trim()] = ((_a = values[index]) === null || _a === void 0 ? void 0 : _a.trim()) || '';
        });
        return row;
    });
}
function seedDatabase() {
    return __awaiter(this, void 0, void 0, function () {
        var supabase, csvContent, rows, prices, maxPrice, processedData, _i, rows_1, row, close_1, sma50, sma200, rsi, _a, bbUpper, bbLower, drawdownPct, i, batch, error;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    console.log("\uD83D\uDE80 Starting Ethereum Database Seed...");
                    supabase = (0, supabase_js_1.createClient)(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
                        auth: { autoRefreshToken: false, persistSession: false },
                    });
                    console.log("\uD83D\uDCC1 Reading CSV from: ".concat(CSV_PATH));
                    csvContent = fs.readFileSync(CSV_PATH, 'utf-8');
                    rows = parseCSV(csvContent);
                    console.log("\u2705 Found ".concat(rows.length, " rows"));
                    prices = [];
                    maxPrice = 0;
                    processedData = [];
                    for (_i = 0, rows_1 = rows; _i < rows_1.length; _i++) {
                        row = rows_1[_i];
                        close_1 = parseFloat(row.Close);
                        prices.push(close_1);
                        if (close_1 > maxPrice)
                            maxPrice = close_1;
                        sma50 = calculateSMA(prices, 50);
                        sma200 = calculateSMA(prices, 200);
                        rsi = calculateRSI(prices, 14);
                        _a = calculateBollingerBands(prices, 20, 2), bbUpper = _a.upper, bbLower = _a.lower;
                        drawdownPct = maxPrice > 0 ? ((close_1 - maxPrice) / maxPrice) * 100 : 0;
                        processedData.push({
                            date: row.Date,
                            close: close_1,
                            open: parseFloat(row.Open),
                            high: parseFloat(row.High),
                            low: parseFloat(row.Low),
                            volume: parseFloat(row.Volume),
                            sma_50: sma50 ? Math.round(sma50 * 100) / 100 : null,
                            sma_200: sma200 ? Math.round(sma200 * 100) / 100 : null,
                            rsi: rsi ? Math.round(rsi * 100) / 100 : null,
                            bb_upper: bbUpper ? Math.round(bbUpper * 100) / 100 : null,
                            bb_lower: bbLower ? Math.round(bbLower * 100) / 100 : null,
                            drawdown_pct: Math.round(drawdownPct * 100) / 100,
                        });
                    }
                    console.log("\uD83D\uDCBE Upserting to ".concat(TABLE_NAME, "..."));
                    i = 0;
                    _b.label = 1;
                case 1:
                    if (!(i < processedData.length)) return [3 /*break*/, 4];
                    batch = processedData.slice(i, i + BATCH_SIZE);
                    return [4 /*yield*/, supabase.from(TABLE_NAME).upsert(batch, { onConflict: 'date' })];
                case 2:
                    error = (_b.sent()).error;
                    if (error)
                        throw error;
                    console.log("   Batch ".concat(Math.floor(i / BATCH_SIZE) + 1, ": ").concat(batch.length, " rows"));
                    _b.label = 3;
                case 3:
                    i += BATCH_SIZE;
                    return [3 /*break*/, 1];
                case 4:
                    console.log("\n\u2705 Ethereum Seed Complete!");
                    return [2 /*return*/];
            }
        });
    });
}
seedDatabase().catch(console.error);

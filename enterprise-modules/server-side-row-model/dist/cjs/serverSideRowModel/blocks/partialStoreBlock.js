"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@ag-grid-community/core");
var PartialStoreBlock = /** @class */ (function (_super) {
    __extends(PartialStoreBlock, _super);
    function PartialStoreBlock(blockNumber, parentRowNode, ssrmParams, storeParams, parentStore) {
        var _this = _super.call(this, blockNumber) || this;
        _this.ssrmParams = ssrmParams;
        _this.storeParams = storeParams;
        _this.parentRowNode = parentRowNode;
        // we don't need to calculate these now, as the inputs don't change,
        // however it makes the code easier to read if we work them out up front
        _this.startRow = blockNumber * storeParams.cacheBlockSize;
        _this.parentStore = parentStore;
        _this.level = parentRowNode.level + 1;
        _this.groupLevel = ssrmParams.rowGroupCols ? _this.level < ssrmParams.rowGroupCols.length : undefined;
        _this.leafGroup = ssrmParams.rowGroupCols ? _this.level === ssrmParams.rowGroupCols.length - 1 : false;
        return _this;
    }
    PartialStoreBlock.prototype.postConstruct = function () {
        this.usingTreeData = this.gridOptionsWrapper.isTreeData();
        this.usingMasterDetail = this.gridOptionsWrapper.isMasterDetail();
        this.defaultRowHeight = this.gridOptionsWrapper.getRowHeightAsNumber();
        if (!this.usingTreeData && this.groupLevel) {
            var groupColVo = this.ssrmParams.rowGroupCols[this.level];
            this.groupField = groupColVo.field;
            this.rowGroupColumn = this.columnController.getRowGroupColumns()[this.level];
        }
        this.nodeIdPrefix = this.blockUtils.createNodeIdPrefix(this.parentRowNode);
        this.setData([]);
    };
    PartialStoreBlock.prototype.isDisplayIndexInBlock = function (displayIndex) {
        return displayIndex >= this.displayIndexStart && displayIndex < this.displayIndexEnd;
    };
    PartialStoreBlock.prototype.isBlockBefore = function (displayIndex) {
        return displayIndex >= this.displayIndexEnd;
    };
    PartialStoreBlock.prototype.getDisplayIndexStart = function () {
        return this.displayIndexStart;
    };
    PartialStoreBlock.prototype.getDisplayIndexEnd = function () {
        return this.displayIndexEnd;
    };
    PartialStoreBlock.prototype.getBlockHeightPx = function () {
        return this.blockHeightPx;
    };
    PartialStoreBlock.prototype.getBlockTopPx = function () {
        return this.blockTopPx;
    };
    PartialStoreBlock.prototype.isGroupLevel = function () {
        return this.groupLevel;
    };
    PartialStoreBlock.prototype.getGroupField = function () {
        return this.groupField;
    };
    PartialStoreBlock.prototype.prefixId = function (id) {
        if (this.nodeIdPrefix) {
            return this.nodeIdPrefix + '-' + id;
        }
        else {
            return id.toString();
        }
    };
    PartialStoreBlock.prototype.getBlockStateJson = function () {
        return {
            id: this.prefixId(this.getId()),
            state: {
                blockNumber: this.getId(),
                startRow: this.startRow,
                endRow: this.startRow + this.storeParams.cacheBlockSize,
                pageStatus: this.getState()
            }
        };
    };
    PartialStoreBlock.prototype.isAnyNodeOpen = function () {
        var openNodeCount = this.rowNodes.filter(function (node) { return node.expanded; }).length;
        return openNodeCount > 0;
    };
    // this method is repeated, see forEachRowNode, why?
    PartialStoreBlock.prototype.forEachNode = function (callback, sequence, includeChildren) {
        if (sequence === void 0) { sequence = new core_1.NumberSequence(); }
        this.rowNodes.forEach(function (rowNode) {
            callback(rowNode, sequence.next());
            // this will only every happen for server side row model, as infinite
            // row model doesn't have groups
            if (includeChildren && rowNode.childStore) {
                var childStore = rowNode.childStore;
                childStore.forEachNodeDeep(callback, sequence);
            }
        });
    };
    PartialStoreBlock.prototype.forEachNodeDeep = function (callback, sequence) {
        this.forEachNode(callback, sequence, true);
    };
    PartialStoreBlock.prototype.forEachNodeShallow = function (callback, sequence) {
        this.forEachNode(callback, sequence, false);
    };
    PartialStoreBlock.prototype.getLastAccessed = function () {
        return this.lastAccessed;
    };
    PartialStoreBlock.prototype.getRowUsingLocalIndex = function (rowIndex) {
        return this.rowNodes[rowIndex - this.startRow];
    };
    PartialStoreBlock.prototype.touchLastAccessed = function () {
        this.lastAccessed = this.ssrmParams.lastAccessedSequence.next();
    };
    PartialStoreBlock.prototype.processServerFail = function () {
        this.parentStore.onBlockLoadFailed(this);
    };
    PartialStoreBlock.prototype.retryLoads = function () {
        if (this.getState() === core_1.RowNodeBlock.STATE_FAILED) {
            this.setStateWaitingToLoad();
            this.rowNodeBlockLoader.checkBlockToLoad();
            this.setData();
        }
        this.forEachNodeShallow(function (node) {
            if (node.childStore) {
                node.childStore.retryLoads();
            }
        });
    };
    PartialStoreBlock.prototype.processServerResult = function (params) {
        this.parentStore.onBlockLoaded(this, params);
    };
    PartialStoreBlock.prototype.setData = function (rows, failedLoad) {
        if (rows === void 0) { rows = []; }
        if (failedLoad === void 0) { failedLoad = false; }
        this.destroyRowNodes();
        var storeRowCount = this.parentStore.getRowCount();
        var startRow = this.getId() * this.storeParams.cacheBlockSize;
        var endRow = Math.min(startRow + this.storeParams.cacheBlockSize, storeRowCount);
        var rowsToCreate = endRow - startRow;
        for (var i = 0; i < rowsToCreate; i++) {
            var rowNode = this.blockUtils.createRowNode({ field: this.groupField, group: this.groupLevel, leafGroup: this.leafGroup,
                level: this.level, parent: this.parentRowNode, rowGroupColumn: this.rowGroupColumn });
            var dataLoadedForThisRow = i < rows.length;
            if (dataLoadedForThisRow) {
                var data = rows[i];
                var defaultId = this.prefixId(this.startRow + i);
                this.blockUtils.setDataIntoRowNode(rowNode, data, defaultId);
                var newId = rowNode.id;
                this.parentStore.removeDuplicateNode(newId);
                this.nodeManager.addRowNode(rowNode);
                this.allNodesMap[rowNode.id] = rowNode;
            }
            this.rowNodes.push(rowNode);
            if (failedLoad) {
                rowNode.failedLoad = true;
            }
        }
    };
    // to safeguard the grid against duplicate nodes, when a row is loaded, we check
    // for another row in the same cache. if another row does exist, we delete it.
    // this covers for when user refreshes the store (which typically happens after a
    // data change) and the same row ends up coming back in a different block, and the
    // new block finishes refreshing before the old block has finished refreshing.
    PartialStoreBlock.prototype.removeDuplicateNode = function (id) {
        var rowNode = this.allNodesMap[id];
        if (!rowNode) {
            return;
        }
        this.blockUtils.destroyRowNode(rowNode);
        var index = this.rowNodes.indexOf(rowNode);
        var stubRowNode = this.blockUtils.createRowNode({ field: this.groupField, group: this.groupLevel, leafGroup: this.leafGroup,
            level: this.level, parent: this.parentRowNode, rowGroupColumn: this.rowGroupColumn });
        this.rowNodes[index] = stubRowNode;
    };
    PartialStoreBlock.prototype.refresh = function () {
        if (this.getState() !== core_1.RowNodeBlock.STATE_WAITING_TO_LOAD) {
            this.setStateWaitingToLoad();
        }
    };
    PartialStoreBlock.prototype.destroyRowNodes = function () {
        this.blockUtils.destroyRowNodes(this.rowNodes);
        this.rowNodes = [];
        this.allNodesMap = {};
    };
    PartialStoreBlock.prototype.setBeans = function (loggerFactory) {
        this.logger = loggerFactory.create('ServerSideBlock');
    };
    PartialStoreBlock.prototype.getRowUsingDisplayIndex = function (displayRowIndex) {
        this.touchLastAccessed();
        var res = this.blockUtils.binarySearchForDisplayIndex(displayRowIndex, this.rowNodes);
        return res;
    };
    PartialStoreBlock.prototype.loadFromDatasource = function () {
        this.cacheUtils.loadFromDatasource({
            startRow: this.startRow,
            endRow: this.startRow + this.storeParams.cacheBlockSize,
            parentNode: this.parentRowNode,
            storeParams: this.ssrmParams,
            successCallback: this.pageLoaded.bind(this, this.getVersion()),
            success: this.success.bind(this, this.getVersion()),
            failCallback: this.pageLoadFailed.bind(this, this.getVersion()),
            fail: this.pageLoadFailed.bind(this, this.getVersion())
        });
    };
    PartialStoreBlock.prototype.isPixelInRange = function (pixel) {
        return pixel >= this.blockTopPx && pixel < (this.blockTopPx + this.blockHeightPx);
    };
    PartialStoreBlock.prototype.getRowBounds = function (index) {
        var _this = this;
        this.touchLastAccessed();
        var res;
        core_1._.find(this.rowNodes, function (rowNode) {
            res = _this.blockUtils.extractRowBounds(rowNode, index);
            return res != null;
        });
        return res;
    };
    PartialStoreBlock.prototype.getRowIndexAtPixel = function (pixel) {
        var _this = this;
        this.touchLastAccessed();
        var res = null;
        core_1._.find(this.rowNodes, function (rowNode) {
            res = _this.blockUtils.getIndexAtPixel(rowNode, pixel);
            return res != null;
        });
        return res;
    };
    PartialStoreBlock.prototype.clearDisplayIndexes = function () {
        var _this = this;
        this.displayIndexEnd = undefined;
        this.displayIndexStart = undefined;
        this.rowNodes.forEach(function (rowNode) { return _this.blockUtils.clearDisplayIndex(rowNode); });
    };
    PartialStoreBlock.prototype.setDisplayIndexes = function (displayIndexSeq, nextRowTop) {
        var _this = this;
        this.displayIndexStart = displayIndexSeq.peek();
        this.blockTopPx = nextRowTop.value;
        this.rowNodes.forEach(function (rowNode) { return _this.blockUtils.setDisplayIndex(rowNode, displayIndexSeq, nextRowTop); });
        this.displayIndexEnd = displayIndexSeq.peek();
        this.blockHeightPx = nextRowTop.value - this.blockTopPx;
    };
    __decorate([
        core_1.Autowired('rowRenderer')
    ], PartialStoreBlock.prototype, "rowRenderer", void 0);
    __decorate([
        core_1.Autowired('columnController')
    ], PartialStoreBlock.prototype, "columnController", void 0);
    __decorate([
        core_1.Autowired('valueService')
    ], PartialStoreBlock.prototype, "valueService", void 0);
    __decorate([
        core_1.Autowired('columnApi')
    ], PartialStoreBlock.prototype, "columnApi", void 0);
    __decorate([
        core_1.Autowired('gridApi')
    ], PartialStoreBlock.prototype, "gridApi", void 0);
    __decorate([
        core_1.Autowired('ssrmCacheUtils')
    ], PartialStoreBlock.prototype, "cacheUtils", void 0);
    __decorate([
        core_1.Autowired('ssrmBlockUtils')
    ], PartialStoreBlock.prototype, "blockUtils", void 0);
    __decorate([
        core_1.Autowired('ssrmNodeManager')
    ], PartialStoreBlock.prototype, "nodeManager", void 0);
    __decorate([
        core_1.Autowired('rowNodeBlockLoader')
    ], PartialStoreBlock.prototype, "rowNodeBlockLoader", void 0);
    __decorate([
        core_1.PostConstruct
    ], PartialStoreBlock.prototype, "postConstruct", null);
    __decorate([
        core_1.PreDestroy
    ], PartialStoreBlock.prototype, "destroyRowNodes", null);
    __decorate([
        __param(0, core_1.Qualifier('loggerFactory'))
    ], PartialStoreBlock.prototype, "setBeans", null);
    return PartialStoreBlock;
}(core_1.RowNodeBlock));
exports.PartialStoreBlock = PartialStoreBlock;
//# sourceMappingURL=partialStoreBlock.js.map
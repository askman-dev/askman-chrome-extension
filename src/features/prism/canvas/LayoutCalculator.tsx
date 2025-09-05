/**
 * 调用方：GridLayoutManager 需要计算网格布局时调用
 * 依赖：Column、ExtractedRow、GridData 类型定义
 */

import type { Column, ExtractedRow, GridData, GridPosition } from './types';

/**
 * 布局计算器 - 实现抽取重组布局算法
 */
export class LayoutCalculator {
  /**
   * 主入口：将扁平的column数组转换为网格布局
   */
  static calculateGridLayout(columns: Column[]): GridData {
    // console.log('LayoutCalculator: Starting grid calculation', {
    //   totalColumns: columns.length,
    //   hasParentRelations: columns.some(c => c.parentColumnId),
    // });

    if (columns.length === 0) {
      return {
        grid: [],
        positions: new Map(),
        dimensions: { rows: 0, cols: 0 },
      };
    }

    // Step 1: 构建分叉关系图
    const relationshipMap = this.buildRelationshipMap(columns);

    // Step 2: 找到根列（没有父列的列）
    // const rootColumns = columns.filter(col => !col.parentColumnId);

    // Step 3: 执行抽取重组算法
    const extractedRows = this.extractAndReorganize(columns, relationshipMap);

    // Step 4: 生成网格矩阵
    const gridData = this.generateGridMatrix(columns, extractedRows);

    // console.log('LayoutCalculator: Grid calculation completed', {
    //   resultDimensions: gridData.dimensions,
    //   totalPositions: gridData.positions.size,
    //   extractedRows: extractedRows.length,
    // });

    return gridData;
  }

  /**
   * 构建列之间的父子关系映射
   */
  private static buildRelationshipMap(columns: Column[]): Map<string, Column[]> {
    const relationshipMap = new Map<string, Column[]>();

    // 为每个列初始化空的子列数组
    columns.forEach(col => {
      relationshipMap.set(col.id, []);
    });

    // 构建父->子关系
    columns.forEach(col => {
      if (col.parentColumnId && relationshipMap.has(col.parentColumnId)) {
        const siblings = relationshipMap.get(col.parentColumnId)!;
        siblings.push(col);
      }
    });

    return relationshipMap;
  }

  /**
   * 核心算法：抽取重组布局
   * 规则：有分叉的列从原位置抽出，与其直接分叉组成新行
   */
  private static extractAndReorganize(columns: Column[], relationshipMap: Map<string, Column[]>): ExtractedRow[] {
    const extractedRows: ExtractedRow[] = [];
    const processed = new Set<string>();

    // 找到所有需要被抽取的列：非根列且有子列的列
    const columnsWithBranches = columns.filter(col => {
      const children = relationshipMap.get(col.id) || [];
      const hasChildren = children.length > 0;
      const isNotRoot = col.parentColumnId !== undefined;
      return hasChildren && isNotRoot; // 只抽取非根列且有分支的列
    });

    // console.log('LayoutCalculator: Found columns with branches', {
    //   branchedColumns: columnsWithBranches.map(c => c.id),
    // });

    // 按分叉层级排序（深度优先）
    const sortedBranchedColumns = this.sortByBranchDepth(columnsWithBranches);

    // 对每个有分叉的列执行抽取
    sortedBranchedColumns.forEach((parentColumn, index) => {
      if (processed.has(parentColumn.id)) return;

      const branchColumns = relationshipMap.get(parentColumn.id) || [];

      // 创建抽取行
      const extractedRow: ExtractedRow = {
        parentColumn,
        branchColumns: [...branchColumns],
        originalPosition: index,
      };

      extractedRows.push(extractedRow);

      // 标记已处理
      processed.add(parentColumn.id);
      branchColumns.forEach(child => processed.add(child.id));

      // console.log('LayoutCalculator: Extracted row', {
      //   parentId: parentColumn.id,
      //   branchIds: branchColumns.map(c => c.id),
      //   rowIndex: extractedRows.length - 1,
      // });
    });

    return extractedRows;
  }

  /**
   * 按分叉深度排序列（深度优先遍历）
   */
  private static sortByBranchDepth(columns: Column[]): Column[] {
    return columns.sort((a, b) => {
      const depthA = this.calculateColumnDepth(a);
      const depthB = this.calculateColumnDepth(b);
      return depthA - depthB; // 浅层优先
    });
  }

  /**
   * 计算列的深度（从根开始）
   */
  private static calculateColumnDepth(column: Column): number {
    let depth = 0;
    const current = column;

    // 向上追溯到根节点
    while (current.parentColumnId) {
      depth++;
      // 简化：这里应该从columns数组中查找parent，暂时返回估计值
      if (depth > 10) break; // 防止无限循环
      // 实际实现中需要传入完整的columns数组进行查找
      break;
    }

    return depth;
  }

  /**
   * 生成最终的网格矩阵
   */
  private static generateGridMatrix(allColumns: Column[], extractedRows: ExtractedRow[]): GridData {
    const grid: (Column | null)[][] = [];
    const positions = new Map<string, GridPosition>();

    // 获取所有被抽取的列的ID
    const extractedIds = new Set<string>();
    extractedRows.forEach(row => {
      extractedIds.add(row.parentColumn.id);
      row.branchColumns.forEach(branch => extractedIds.add(branch.id));
    });

    // 第0行：所有未被抽取的列（包括根列和分支列）
    const row0Columns = allColumns.filter(col => !extractedIds.has(col.id));

    if (row0Columns.length > 0) {
      // 根据原始关系排序：根列在前，然后是它们的直接分支
      const sortedRow0 = this.sortColumnsForRow0(row0Columns, allColumns);
      grid.push(sortedRow0);

      // 记录第0行位置
      sortedRow0.forEach((col, colIndex) => {
        if (col) {
          positions.set(col.id, { row: 0, col: colIndex });
        }
      });
    }

    // 后续行：抽取出的行
    extractedRows.forEach((extractedRow, rowIndex) => {
      const actualRowIndex = rowIndex + 1; // 第0行是根列
      const rowColumns: (Column | null)[] = [extractedRow.parentColumn, ...extractedRow.branchColumns];

      grid.push(rowColumns);

      // 记录位置
      rowColumns.forEach((col, colIndex) => {
        if (col) {
          positions.set(col.id, { row: actualRowIndex, col: colIndex });
        }
      });
    });

    // 计算维度
    const maxCols = Math.max(...grid.map(row => row.length), 0);

    // console.log('LayoutCalculator: Grid matrix generated', {
    //   totalRows: grid.length,
    //   maxCols,
    //   row0Count: grid[0]?.length || 0,
    //   extractedRowsCount: extractedRows.length,
    // });

    return {
      grid,
      positions,
      dimensions: {
        rows: grid.length,
        cols: maxCols,
      },
    };
  }

  /**
   * 对第0行的列进行排序：根列在前，然后是它们的直接分支
   */
  private static sortColumnsForRow0(row0Columns: Column[], _allColumns: Column[]): Column[] {
    // 分离根列和分支列
    const rootColumns = row0Columns.filter(col => !col.parentColumnId);
    const branchColumns = row0Columns.filter(col => col.parentColumnId);

    // 根列按ID排序（或其他逻辑）
    rootColumns.sort((a, b) => a.id.localeCompare(b.id));

    // 为每个根列找到其直接分支，并按顺序排列
    const result: Column[] = [];
    rootColumns.forEach(root => {
      result.push(root);
      const branches = branchColumns.filter(branch => branch.parentColumnId === root.id);
      branches.sort((a, b) => a.id.localeCompare(b.id));
      result.push(...branches);
    });

    // 添加没有父列在第0行的孤儿分支列
    const orphanBranches = branchColumns.filter(branch => !rootColumns.some(root => root.id === branch.parentColumnId));
    result.push(...orphanBranches);

    // console.log('LayoutCalculator: Sorted row 0 columns', {
    //   totalColumns: row0Columns.length,
    //   rootColumns: rootColumns.length,
    //   branchColumns: branchColumns.length,
    //   sortedOrder: result.map(col => col.id),
    // });

    return result;
  }
}

/**
 * 布局算法的工具函数集合
 */
export class LayoutUtils {
  /**
   * 验证网格数据的一致性
   */
  static validateGridData(gridData: GridData): boolean {
    const { grid, positions, dimensions } = gridData;

    // 检查维度一致性
    if (grid.length !== dimensions.rows) {
      console.warn('LayoutUtils: Row count mismatch', {
        actualRows: grid.length,
        expectedRows: dimensions.rows,
      });
      return false;
    }

    // 检查位置映射完整性
    const gridColumns = grid.flat().filter(col => col !== null);
    if (gridColumns.length !== positions.size) {
      console.warn('LayoutUtils: Position mapping incomplete', {
        gridColumns: gridColumns.length,
        mappedPositions: positions.size,
      });
      return false;
    }

    return true;
  }

  /**
   * 调试输出网格结构
   */
  static debugPrintGrid(gridData: GridData): void {
    console.group('LayoutUtils: Grid Structure Debug');

    gridData.grid.forEach((row, rowIndex) => {
      const rowIds = row.map(col => col?.id.slice(-8) || '∅').join(' | ');
      console.log(`Row ${rowIndex}: [${rowIds}]`);
    });

    console.log('Positions:');
    Array.from(gridData.positions.entries()).forEach(([id, pos]) => {
      console.log(`  ${id.slice(-8)}: (${pos.row}, ${pos.col})`);
    });

    console.groupEnd();
  }
}

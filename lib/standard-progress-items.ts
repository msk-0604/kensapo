/** 標準の工事進行チェック項目（設備工事向けテンプレート） */
export type StandardProgressItem = {
  category: string;
  section: string | null;
  item_name: string;
};

export const STANDARD_PROGRESS_ITEMS: StandardProgressItem[] = [
  // 基本工事
  { category: "基本工事", section: null, item_name: "メーター廻り" },
  { category: "基本工事", section: null, item_name: "給水" },
  { category: "基本工事", section: null, item_name: "給湯" },
  { category: "基本工事", section: null, item_name: "排水" },
  { category: "基本工事", section: null, item_name: "ガス" },
  { category: "基本工事", section: null, item_name: "下水" },
  { category: "基本工事", section: null, item_name: "雨水" },
  { category: "基本工事", section: null, item_name: "水圧テスト" },
  { category: "基本工事", section: null, item_name: "器具取付" },
  { category: "基本工事", section: null, item_name: "接続" },
  { category: "基本工事", section: null, item_name: "調整" },
  { category: "基本工事", section: null, item_name: "図面確認" },
  { category: "基本工事", section: null, item_name: "竣工図" },
  { category: "基本工事", section: null, item_name: "検査書類" },
  // 屋内 1F
  { category: "屋内", section: "1F", item_name: "キッチン 給水" },
  { category: "屋内", section: "1F", item_name: "キッチン 給湯" },
  { category: "屋内", section: "1F", item_name: "キッチン 排水" },
  { category: "屋内", section: "1F", item_name: "キッチン ガス" },
  { category: "屋内", section: "1F", item_name: "浴室 給水" },
  { category: "屋内", section: "1F", item_name: "浴室 給湯" },
  { category: "屋内", section: "1F", item_name: "浴室 排水" },
  { category: "屋内", section: "1F", item_name: "浴室 追焚き" },
  { category: "屋内", section: "1F", item_name: "洗面 給水" },
  { category: "屋内", section: "1F", item_name: "洗面 給湯" },
  { category: "屋内", section: "1F", item_name: "洗面 排水" },
  { category: "屋内", section: "1F", item_name: "洗濯 給水" },
  { category: "屋内", section: "1F", item_name: "洗濯 排水" },
  { category: "屋内", section: "1F", item_name: "トイレ 給水" },
  { category: "屋内", section: "1F", item_name: "トイレ 排水" },
  { category: "屋内", section: "1F", item_name: "手洗い 給水" },
  { category: "屋内", section: "1F", item_name: "手洗い 排水" },
  // 屋内 2F
  { category: "屋内", section: "2F", item_name: "キッチン 給水" },
  { category: "屋内", section: "2F", item_name: "キッチン 給湯" },
  { category: "屋内", section: "2F", item_name: "キッチン 排水" },
  { category: "屋内", section: "2F", item_name: "キッチン ガス" },
  { category: "屋内", section: "2F", item_name: "浴室 給水" },
  { category: "屋内", section: "2F", item_name: "浴室 給湯" },
  { category: "屋内", section: "2F", item_name: "浴室 排水" },
  { category: "屋内", section: "2F", item_name: "洗面 給水" },
  { category: "屋内", section: "2F", item_name: "洗面 給湯" },
  { category: "屋内", section: "2F", item_name: "洗面 排水" },
  { category: "屋内", section: "2F", item_name: "トイレ 給水" },
  { category: "屋内", section: "2F", item_name: "トイレ 排水" },
  { category: "屋内", section: "2F", item_name: "手洗い 給水" },
  { category: "屋内", section: "2F", item_name: "手洗い 排水" },
  // 水圧テスト
  { category: "水圧テスト", section: null, item_name: "外部" },
  { category: "水圧テスト", section: null, item_name: "内部" },
  { category: "水圧テスト", section: null, item_name: "器具" },
  { category: "水圧テスト", section: null, item_name: "3回実施" },
  // 書類関係
  { category: "書類関係", section: null, item_name: "給水チェックリスト" },
  { category: "書類関係", section: null, item_name: "給水オーダー" },
  { category: "書類関係", section: null, item_name: "給水図面" },
  { category: "書類関係", section: null, item_name: "給水竣工図" },
  { category: "書類関係", section: null, item_name: "給水検査書類" },
  { category: "書類関係", section: null, item_name: "下水チェックリスト" },
  { category: "書類関係", section: null, item_name: "下水オーダー" },
  { category: "書類関係", section: null, item_name: "下水図面" },
  { category: "書類関係", section: null, item_name: "下水竣工図" },
  { category: "書類関係", section: null, item_name: "下水検査書類" },
];

import {
  CircleIcon,
  WindmillIcon,
  TypographyIcon,
  ShadowIcon,
  PaletteIcon,
  KeyIcon,
  BugIcon,
  DashboardIcon,
  BrandChromeIcon,
  HelpIcon,
  FileDescriptionIcon 
} from 'vue-tabler-icons';

export interface menu {
  header?: string;
  title?: string;
  icon?: object;
  to?: string;
  divider?: boolean;
  chip?: string;
  chipColor?: string;
  chipVariant?: string;
  chipIcon?: string;
  children?: menu[];
  disabled?: boolean;
  type?: string;
  subCaption?: string;
}

const sidebarItem: menu[] = [
  { header: '仪表盘' },
  {
    title: '默认首页',
    icon: DashboardIcon,
    to: '/dashboard/default'
  },
  { divider: true },
  { header: '页面' },
  {
    title: '历史证明材料',
    icon: FileDescriptionIcon, // 文件/文档图标
    to: '/history-proof'
  },
  {
    title: '个人勋章&NFT',
    icon: FileDescriptionIcon,
    to: '/nft'
  },

  { divider: true },

  {
    title: '文档',
    icon: HelpIcon,
    to: 'https://codedthemes.gitbook.io/berry-vuetify/',
    type: 'external'
  }
];

export default sidebarItem;

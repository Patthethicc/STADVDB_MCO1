declare module '@tabler/icons-react' {
  import * as React from 'react';

  export interface TablerIconProps extends React.SVGProps<SVGSVGElement> {
    size?: number | string;
    strokeWidth?: number;
  }

  const TablerIcons: { [key: string]: React.FC<TablerIconProps> };
  export default TablerIcons;

  export type Icon = React.FC<TablerIconProps>;
  export const IconChevronLeft: Icon;
  export const IconChevronRight: Icon;
  export const IconChevronsLeft: Icon;
  export const IconChevronsRight: Icon;
  export const IconLoader: Icon;
  export const IconDots: Icon;
  export const IconFolder: Icon;
  export const IconShare3: Icon;
  export const IconTrash: Icon;
  export const IconTrendingDown: Icon;
  export const IconTrendingUp: Icon;
}

export interface Link {
    title: string;
    link: string;
    icon?: React.ReactNode;
    children?: Link[];
}
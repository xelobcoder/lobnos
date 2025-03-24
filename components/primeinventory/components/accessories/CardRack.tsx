import React, { ReactNode } from "react";

interface CardRacksProps {
    header: ReactNode;
    activestate?: boolean;
    body: ReactNode;
    className?: string;
    footer?: ReactNode;
    icon?: ReactNode;
    [key: string]: any;
}

const CardRacks: React.FC<CardRacksProps> = ({
    header,
    activestate,
    body,
    className = "",
    footer,
    icon = null,
    ...otherProps
}) => {
    return (
        <div style={{width:'100%'}} className={`list-group br-0 pointer pls-color ${activestate ? " heightedBorder" : ""} ${className}`} {...otherProps}>
            <div className={`list-group-item br-0 bg-secondary-subtle fw-bold text-capitalize`}>
                {icon} {header}
            </div>
            <div className="list-group-item">{body}</div>
            {footer && <div className="list-group-item">{footer}</div>}
        </div>
    );
};

export default CardRacks;

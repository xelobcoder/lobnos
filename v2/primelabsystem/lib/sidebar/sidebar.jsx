import { ArrowForwardIos, GetAppOutlined } from "@mui/icons-material";

export default function SideBarNavigational() {
    return (
        <ul class="side-menu">
            <li><a href="#">
                <span>
                    <GetAppOutlined /> </span>
                <span className="text">
                    Superguide
                </span>
                <span className="drop-down">
                    <ArrowForwardIos />
                </span>
            </a>
            </li>
            <li><a href="#">
                <span>
                    <GetAppOutlined /> </span>
                <span className="text">
                    Superguide
                </span>
            </a>
            </li>

            <li><a href="#">
                <span>
                    <GetAppOutlined /> </span>
                <span className="text">
                    Superguide
                </span>
            </a>
            </li>

            <li><a href="#">
                <span>
                    <GetAppOutlined /> </span>
                <span className="text">
                    Superguide
                </span>
            </a>
            </li>

            <li><a href="#">
                <span>
                    <GetAppOutlined /> </span>
                <span className="text">
                    Superguide
                </span>
            </a>
            </li>

        </ul>
    )
}
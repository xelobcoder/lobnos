import style from '../../styles/Messages.module.css';
import { Typography } from '@mui/material';
export default function Messages({ message, type,icon }) {
    return (
        <>
            <div className={style.wrapper}>
                <div className={style.success}>
                    <div className={style.side}>
                         {
                            icon
                         }
                    </div>
                    <div className={style.body}>
                        <Typography variant='h6'>Changes saved</Typography>
                        <Typography>{message}</Typography>
                    </div>
                    <div>
                        &times;
                    </div>
                </div>
            </div>
        </>
    )
}
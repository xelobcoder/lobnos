import styles from '../styles/PatientDashboard.module.css'
import Image from 'next/image';
import {
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    InputBase,
    IconButton,
    Box,
    LinearProgress,
    Typography,
    Button,
    Card,
    CardContent,
    Grid,
    styled,
    alpha
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import GroupIcon from '@mui/icons-material/Group';
import EmailIcon from '@mui/icons-material/Email';
import PaymentIcon from '@mui/icons-material/Payment';
import SettingsIcon from '@mui/icons-material/Settings';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import AddIcon from '@mui/icons-material/Add';
import StarBorderIcon from '@mui/icons-material/StarBorder';


const PatientDashboard = () => {
    const healthCheckupData = [
        { name: 'Cardiology', progress: 0.8 },
        { name: 'Neurology', progress: 0.6 },
        { name: 'Nephrology', progress: 0.4 },
        { name: 'Pulmonology', progress: 0.9 },
        { name: 'Gastroenterology', progress: 0.7 },
        { name: 'Gynecology', progress: 0.3 },
        { name: 'Dental', progress: 0.5 },
    ];

    const fileList = [
        { name: 'Check Up Result.pdf', size: '123kb' },
        { name: 'Dental X-Ray Result.pdf', size: '84kb' },
        { name: 'Medical Prescriptions.pdf', size: '29kb' },
        { name: 'Check Up Result.pdf', size: '140kb' },
        { name: 'Check Up Result1.pdf', size: '110kb' },
        { name: 'Check Up Result8.pdf', size: '65kb' },
    ];

    // Styled Components for MUI
    const Search = styled('div')(({ theme }) => ({
        position: 'relative',
        borderRadius: theme.shape.borderRadius,
        backgroundColor: alpha(theme.palette.common.white, 0.15),
        '&:hover': {
            backgroundColor: alpha(theme.palette.common.white, 0.25),
        },
        marginRight: theme.spacing(2),
        marginLeft: 0,
        width: '100%',
        [theme.breakpoints.up('sm')]: {
            marginLeft: theme.spacing(3),
            width: 'auto',
        },
    }));

    const SearchIconWrapper = styled('div')(({ theme }) => ({
        padding: theme.spacing(0, 2),
        height: '100%',
        position: 'absolute',
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    }));

    const StyledInputBase = styled(InputBase)(({ theme }) => ({
        color: 'inherit',
        '& .MuiInputBase-input': {
            padding: theme.spacing(1, 1, 1, 0),
            // vertical padding + font size from searchIcon
            paddingLeft: `calc(1em + ${theme.spacing(4)})`,
            transition: theme.transitions.create('width'),
            width: '100%',
            [theme.breakpoints.up('md')]: {
                width: '20ch',
            },
        },
    }));


   

    return (
        <div className={`container-fluid ${styles.dashboardContainer}`}>
            <div className="row">
                {/* Sidebar */}
                <nav className={`col-md-3 col-lg-2 d-md-block bg-light sidebar ${styles.sidebar}`}>
                    <div className="position-sticky pt-3">
                        <div className={`text-center ${styles.logo}`}>greenhealth</div>
                        <List component="nav">
                            <ListItem button className={styles.listItem}>
                                <ListItemIcon><DashboardIcon /></ListItemIcon>
                                <ListItemText primary="Overview" />
                            </ListItem>
                            <ListItem button className={styles.listItem}>
                                <ListItemIcon><CalendarMonthIcon /></ListItemIcon>
                                <ListItemText primary="Calendar" />
                            </ListItem>
                            <ListItem button className={`${styles.listItem} ${styles.active}`}>
                                <ListItemIcon><GroupIcon /></ListItemIcon>
                                <ListItemText primary="Patient List" />
                            </ListItem>
                            <ListItem button className={styles.listItem}>
                                <ListItemIcon><EmailIcon /></ListItemIcon>
                                <ListItemText primary="Messages" />
                            </ListItem>
                            <ListItem button className={styles.listItem}>
                                <ListItemIcon><PaymentIcon /></ListItemIcon>
                                <ListItemText primary="Payment Information" />
                            </ListItem>
                            <ListItem button className={styles.listItem}>
                                <ListItemIcon><SettingsIcon /></ListItemIcon>
                                <ListItemText primary="Settings" />
                            </ListItem>
                        </List>
                    </div>
                </nav>

                {/* Main Content */}
                <main className={`col-md-9 ms-sm-auto col-lg-10 px-md-4 ${styles.mainContent}`}>
                    {/* Top Bar */}
                    <div className={`d-flex justify-content-between align-items-center pt-3 pb-2 mb-3 border-bottom ${styles.topBar}`}>
                        <div className={styles.breadcrumbs}>
                            <StarBorderIcon fontSize="small" style={{ marginRight: '4px', color: '#bdbdbd' }} />
                            <span>Patient List</span> / <span>Angela Smith</span>
                        </div>
                        <Search>
                            <SearchIconWrapper>
                                <SearchIcon />
                            </SearchIconWrapper>
                            <StyledInputBase
                                placeholder="Search…"
                                inputProps={{ 'aria-label': 'search' }}
                            />
                        </Search>
                    </div>

                    {/* Patient Info */}
                    <section className={`bg-white rounded shadow-sm mb-3 ${styles.patientInfoSection}`}>
                        <div className="row p-3">
                            <div className="col-md-4 text-center">
                                <Image src="/profile-placeholder.jpg" alt="Patient" width={100} height={100} className={styles.profileImage} style={{ borderRadius: '50%' }} />
                                <div className={styles.patientName}>Angela Smith</div>
                                <div className={styles.patientEmail}>angela.smith@gmail.com</div>
                                <Button variant="contained" className={styles.sendMessageButton}>Send Message</Button>
                            </div>
                            <div className="col-md-8">
                                <div className="row">
                                    <div className="col-md-6">
                                        <div><span>Gender</span> Female</div>
                                        <div><span>Birthday</span> Feb 15th, 1993</div>
                                        <div><span>Phone Number</span> (156) 333-3407</div>
                                    </div>
                                    <div className="col-md-6">
                                        <div><span>Street Address</span> 11 West 53 Street, Manhattan</div>
                                        <div><span>City</span> New York</div>
                                        <div><span>ZIP Code</span> 122656</div>
                                    </div>
                                    <div className="col-md-6">
                                        <div><span>Member Status</span> Active Member</div>
                                    </div>
                                    <div className="col-md-6">
                                        <div><span>Register Date</span> Feb 23th, 2014</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Charts and Notes */}
                    <div className="row">
                        <div className="col-md-6">
                            <Card className={styles.chartBox}>
                                <CardContent>
                                    <Typography variant="h6" component="div" className={styles.chartTitle}>
                                        Glucose
                                    </Typography>
                                    <Typography color="textSecondary" className={styles.chartAvg}>
                                        Today: avg. 211 mg/dl
                                    </Typography>
                                    <div className={styles.chart}>
                                        {/* Placeholder for chart */}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                        <div className="col-md-6">
                            <Card className={styles.chartBox}>
                                <CardContent>
                                    <Typography variant="h6" component="div" className={styles.chartTitle}>
                                        Heart Rate
                                    </Typography>
                                    <Typography color="textSecondary" className={styles.chartAvg}>
                                        Today: avg. 80 bpm
                                    </Typography>
                                    <div className={styles.chart}>
                                        {/* Placeholder for chart */}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-6">
                            <Card className={styles.notes}>
                                <CardContent>
                                    <Box display="flex" justifyContent="space-between" alignItems="center" className={styles.notesHeader}>
                                        <Typography variant="h6">Notes</Typography>
                                        <IconButton size="small" className={styles.addButton}>
                                            <AddIcon />
                                        </IconButton>
                                    </Box>
                                    <List>
                                        {[
                                            "This patient is lorem ipsum dolor",
                                            "Lorem ipsum dolor sit amet",
                                            "Has alergic history",
                                            "Lorem ipsum dolor sit amet",
                                            "Has alergic history",
                                            "Lorem ipsum dolor sit amet",
                                        ].map((note, index) => (
                                            <ListItem key={index} disableGutters className={styles.noteItem}>
                                                • {note}
                                            </ListItem>
                                        ))}
                                    </List>
                                </CardContent>
                            </Card>
                        </div>
                        <div className="col-md-6">
                            <Card className={styles.files}>
                                <CardContent>
                                    <Box display="flex" justifyContent="space-between" alignItems="center" className={styles.filesHeader}>
                                        <Typography variant="h6">Files/Documents</Typography>
                                        <IconButton size="small" className={styles.addButton}>
                                            <AddIcon />
                                        </IconButton>
                                    </Box>
                                    <List>
                                        {fileList.map((file, index) => (
                                            <ListItem key={index} disableGutters className={styles.fileItem}>
                                                <ListItemIcon><InsertDriveFileIcon /></ListItemIcon>
                                                <ListItemText primary={file.name} secondary={file.size} />
                                            </ListItem>
                                        ))}
                                    </List>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Full Health Check-Up */}
                    <section className={`bg-white rounded shadow-sm mb-3 ${styles.healthCheckupSection}`}>
                        <Typography variant="h6" gutterBottom>Full Health Check-Up</Typography>
                        {healthCheckupData.map((item, index) => (
                            <div key={index} className="d-flex justify-content-between align-items-center mb-2">
                                <Typography>{item.name}</Typography>
                                <Box width="60%" mr={1}>
                                    <LinearProgress variant="determinate" value={item.progress * 100} />
                                </Box>
                            </div>
                        ))}
                    </section>
                </main>
            </div>
        </div>
    );
};

export default PatientDashboard;

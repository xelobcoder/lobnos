import React, { useRef, useEffect } from 'react';
import { IconButton, InputBase, Select, MenuItem } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';

const ShutterstockSection = () => {
    const imageURLs = [
        "https://image.shutterstock.com/image-photo/namib-desert-dunes-namibia-africa-260nw-2281414929.jpg",
        "https://image.shutterstock.com/image-photo/cape-town-aerial-view-table-260nw-2349082732.jpg",
        "https://image.shutterstock.com/image-photo/group-african-giraffes-walking-through-260nw-2242534229.jpg",
        "https://image.shutterstock.com/image-photo/beautiful-african-landscape-tall-acacia-260nw-2370847214.jpg",
        "https://image.shutterstock.com/image-photo/kenya-nairobi-cityscape-sunrise-east-260nw-2363360670.jpg"
    ];

    const relatedSearches = [
        "Africa map", "Africa pattern", "Africa continent", "Africa landscape",
        "South africa", "Africa safari", "Africa logo", "Africa people",
        "Africa city", "Africa background", "Africa icon"
    ];

    const imageContainerRef = useRef(null);

    useEffect(() => {
        const container = imageContainerRef.current;

        if (container) {
            const scrollAmount = 2; // Adjust the scrolling speed as needed
            const scroll = () => {
                container.scrollLeft += scrollAmount;
                if (container.scrollLeft >= (container.scrollWidth - container.clientWidth)) {
                    container.scrollLeft = 0; // Loop back to the beginning
                }
            };

            const intervalId = setInterval(scroll, 20); // Adjust interval for smoother animation

            // Clean up the interval when the component unmounts
            return () => clearInterval(intervalId);
        }
    }, []);

    return (
        <div className="bg-white">
            {/* Top Navigation Bar */}
            <div className="bg-dark text-white py-2 text-sm text-center">
                Get 10 royalty-free image downloads each month with a cost-saving subscription. <a href="#" className="font-weight-bold text-white">Buy now</a>
            </div>

            {/* Header */}
            <header className="container py-3">
                <div className="d-flex align-items-center justify-content-between">
                    {/* Logo */}
                    <div className="logo">
                        <a href="/">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Shutterstock_logo.svg/1280px-Shutterstock_logo.svg.png" alt="Shutterstock Logo" width={150} height={40} />
                        </a>
                    </div>

                    {/* Navigation Links */}
                    <nav className="d-none d-md-block">
                        <ul className="list-inline mb-0">
                            <li className="list-inline-item"><a href="#" className="text-muted text-decoration-none">Images</a></li>
                            <li className="list-inline-item"><a href="#" className="text-muted text-decoration-none">Video</a></li>
                            <li className="list-inline-item"><a href="#" className="text-muted text-decoration-none">Browse Content</a></li>
                            <li className="list-inline-item"><a href="#" className="text-muted text-decoration-none">AI Generator</a></li>
                            <li className="list-inline-item"><a href="#" className="text-muted text-decoration-none">Enterprise</a></li>
                        </ul>
                    </nav>

                    {/* Right Side (Pricing, Login, Signup) */}
                    <div className="d-flex align-items-center">
                        <a href="#" className="text-muted text-decoration-none d-none d-lg-block mr-3">Pricing</a>
                        <FavoriteBorderOutlinedIcon className="mr-3" />
                        <ShoppingCartOutlinedIcon className="mr-3" />
                        <NotificationsOutlinedIcon className="mr-3" />
                        <a href="#" className="text-muted text-decoration-none d-none d-lg-block mr-3">Log in</a>
                        <button type="button" className="btn btn-primary">Sign up</button>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="mt-3 d-flex align-items-center" style={{ border: '1px solid #ced4da', borderRadius: '4px' }}>
                    <Select
                        defaultValue="all"
                        variant="standard"
                        disableUnderline
                        style={{ marginRight: '8px', marginLeft: '8px' }}
                    >
                        <MenuItem value="all">All images</MenuItem>
                    </Select>
                    <InputBase
                        placeholder="africa"
                        style={{ flex: 1, padding: '8px' }}
                    />
                    <IconButton type="submit" aria-label="search" color="primary">
                        <SearchIcon />
                    </IconButton>
                </div>

                {/* Related Searches */}
                <div className="mt-2">
                    <span className="text-muted">Related searches:</span>
                    <ul className="list-inline mb-0">
                        {relatedSearches.map((search, index) => (
                            <li className="list-inline-item" key={index}>
                                <a href="#" className="btn btn-light btn-sm">{search}</a>
                            </li>
                        ))}
                    </ul>
                </div>
            </header>

            {/* Image Gallery */}
            <section className="container mt-4">
                <div className="d-flex justify-content-between align-items-center">
                    <h2>Africa images</h2>
                    <a href="#">See all</a>
                </div>
                <p className="text-muted small">5,239,502 africa stock photos, vectors, and illustrations are available royalty-free for download. <a href="#">See africa stock video clips</a></p>

                <h3 className="mt-3">Top africa photos</h3>
                {/* Image Grid */}
                <div className="d-flex overflow-auto" ref={imageContainerRef} style={{ overflow: 'hidden' }}>
                    {imageURLs.map((url, index) => (
                        <div key={index} className="mr-3">
                            <div style={{ width: '240px', height: '160px', position: 'relative' }}>
                                <img
                                    src={url}
                                    alt={`Africa ${index + 1}`}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        borderRadius: '0.25rem'
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default ShutterstockSection;

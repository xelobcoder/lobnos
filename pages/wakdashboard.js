// components/Sidebar.js
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';

const Sidebar = () => {
  const { pathname } = useRouter();

  // Helper function to determine if the link is active
  const isActive = (path) => pathname === path ? 'active' : '';

  return (
    <div className="sidebar sidebar-dark sidebar-main sidebar-expand-md">
      {/* Sidebar mobile toggler */}
      <div className="sidebar-mobile-toggler text-center">
        <Link href="#">
          <i className="icon-arrow-left8"></i>
          <span>Navigation</span>
          <i className="icon-screen-full"></i>
          <i className="icon-screen-normal"></i>
        </Link>
      </div>
      {/* /sidebar mobile toggler */}

      {/* Sidebar content */}
      <div className="sidebar-content">
        {/* User menu */}
        <div className="sidebar-user">
          <div className="card-body">
            <div className="media">
              <div className="mr-3">
                <Link href="/my_account">
                  <Image
                    src="/path/to/photo.jpg" // Replace with dynamic user photo URL
                    width={38}
                    height={38}
                    className="rounded-circle"
                    alt="User Photo"
                  />
                </Link>
              </div>
              <div className="media-body">
                <div className="media-title font-weight-semibold">John Doe</div>
                <div className="font-size-xs opacity-50">
                  <i className="icon-user font-size-sm"></i> &nbsp;Admin
                </div>
              </div>
              <div className="ml-3 align-self-center">
                <Link href="/my_account">
                  <i className="icon-cog3 text-white"></i>
                </Link>
              </div>
            </div>
          </div>
        </div>
        {/* /user menu */}

        {/* Main navigation */}
        <div className="card card-sidebar-mobile">
          <ul className="nav nav-sidebar" data-nav-type="accordion">
            {/* Dashboard */}
            <li className="nav-item">
              <Link href="/dashboard">
                <div className={`nav-link ${isActive('/dashboard')}`}>
                  <i className="icon-home4"></i>
                  <span>Dashboard</span>
                </div>
              </Link>
            </li>

            {/* Academics */}
            <li className="nav-item nav-item-submenu">
              <Link href="#">
                <div className="nav-link">
                  <i className="icon-graduation2"></i> <span>Academics</span>
                </div>
              </Link>
              <ul className="nav nav-group-sub" data-submenu-title="Manage Academics">
                <li className="nav-item">
                  <Link href="/tt/index">
                    <div className={`nav-link ${isActive('/tt/index')}`}>Timetables</div>
                  </Link>
                </li>
              </ul>
            </li>

            {/* Administrative */}
            <li className="nav-item nav-item-submenu">
              <Link href="#">
                <div className="nav-link">
                  <i className="icon-office"></i> <span>Administrative</span>
                </div>
              </Link>
              <ul className="nav nav-group-sub" data-submenu-title="Administrative">
                <li className="nav-item nav-item-submenu">
                  <Link href="#">
                    <div className={`nav-link ${['/payments/index', '/payments/create', '/payments/edit', '/payments/manage', '/payments/show', '/payments/invoice'].includes(pathname) ? 'active' : ''}`}>
                      Payments
                    </div>
                  </Link>
                  <ul className="nav nav-group-sub">
                    <li className="nav-item">
                      <Link href="/payments/create">
                        <div className={`nav-link ${isActive('/payments/create')}`}>Create Payment</div>
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link href="/payments/index">
                        <div className={`nav-link ${isActive('/payments/index')}`}>Manage Payments</div>
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link href="/payments/manage">
                        <div className={`nav-link ${isActive('/payments/manage')}`}>Student Payments</div>
                      </Link>
                    </li>
                  </ul>
                </li>
              </ul>
            </li>

            {/* Manage Students */}
            <li className="nav-item nav-item-submenu">
              <Link href="#">
                <div className="nav-link">
                  <i className="icon-users"></i> <span>Students</span>
                </div>
              </Link>
              <ul className="nav nav-group-sub" data-submenu-title="Manage Students">
                <li className="nav-item">
                  <Link href="/students/create">
                    <div className={`nav-link ${isActive('/students/create')}`}>Admit Student</div>
                  </Link>
                </li>
                <li className="nav-item nav-item-submenu">
                  <Link href="#">
                    <div className={`nav-link ${['/students/list', '/students/edit', '/students/show'].includes(pathname) ? 'active' : ''}`}>
                      Student Information
                    </div>
                  </Link>
                  <ul className="nav nav-group-sub">
                    <li className="nav-item">
                      <Link href="/students/list/class-1">
                        <div className={`nav-link ${isActive('/students/list/class-1')}`}>Class 1</div>
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link href="/students/list/class-2">
                        <div className={`nav-link ${isActive('/students/list/class-2')}`}>Class 2</div>
                      </Link>
                    </li>
                  </ul>
                </li>
                <li className="nav-item">
                  <Link href="/students/graduated">
                    <div className={`nav-link ${isActive('/students/graduated')}`}>Students Graduated</div>
                  </Link>
                </li>
              </ul>
            </li>

            {/* Manage Account */}
            <li className="nav-item">
              <Link href="/my_account">
                <div className={`nav-link ${isActive('/my_account')}`}>
                  <i className="icon-user"></i> <span>My Account</span>
                </div>
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

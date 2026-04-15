import { NavLink } from "react-router-dom";
import styles from "./AsideMenuOption.module.css";


interface IAsideMenuOptionProps {
  icon: React.ReactNode;
  // label: string;
  navigateTo: string;
  notification?: string | number;
}

export function AsideMenuOption({ icon, navigateTo, notification }: IAsideMenuOptionProps) {

  const linkClassName = ({ isActive }: { isActive: boolean }) => {
    let className = styles.linkBase;

    if (isActive) {
      className += ` ${styles.activeLink}`;
    } else {
      className += ` ${styles.inactiveLink}`;
    }


    return className;
  }


  return (
    <li className={styles.menuOption}>
        <NavLink
            to={navigateTo}
            className={linkClassName}
            >
            <div className={styles.iconContainer}>
                {icon}
                {notification && <div className={styles.notificationContainer}>{notification}</div>}
            </div>
        </NavLink>
    </li>
  );
}
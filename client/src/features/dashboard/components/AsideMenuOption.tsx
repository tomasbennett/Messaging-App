import { NavLink } from "react-router-dom";
import styles from "./AsideMenuOption.module.css";


interface IAsideMenuOptionProps {
  icon: React.ReactNode;
  label: string;
  navigateTo: string;
  notification?: string | number;
}

export function AsideMenuOption({ icon, label, navigateTo, notification }: IAsideMenuOptionProps) {
  return (
    <li className={styles.menuOption}>
        <NavLink
            to={navigateTo}
            className={({ isActive }) => isActive ? styles.activeLink : styles.inactiveLink}
            >
            <div className={styles.iconContainer}>
                {icon}
                {notification && <div className={styles.notificationContainer}>{notification}</div>}
            </div>
            <span className={styles.label}>{label}</span>
        </NavLink>
    </li>
  );
}
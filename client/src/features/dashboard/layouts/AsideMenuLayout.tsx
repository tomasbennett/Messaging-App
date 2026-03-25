import styles from "./AsideMenuLayout.module.css";
import githubImage from "../../../assets/github-profile-image.png";

interface IAsideMenuLayoutProps {
    children: React.ReactNode;
}

export function AsideMenuLayout({
    children
}: IAsideMenuLayoutProps) {
    return (
        <>

            <header className={styles.header}>
                <div className={styles.titleContainer}>
                    <div className={styles.gitHubProfileImgContainer}>
                        <img src={githubImage} alt="Github Profile Image" />
                    </div>
                    <h1 className={styles.title}>MessageApp</h1>
                </div>
            </header>

            <div className={styles.lowerContainer}>

                <aside className={styles.aside}>
                    <ul className={styles.menuOptionsList}>







                    </ul>
                </aside>

                <main className={styles.main}>
                    {
                        children
                    }
                </main>

            </div>

        </>
    );
}
import styles from "./SharedOrSingleProfileImg.module.css";


type ISharedOrSingleProfileImgProps = {

}

//INSTEAD JUST DO A BORDER RADIUS 50% AND THEN A NUMBER AT THE BOTTOM RIGHT
//BORDER RADIUS 50% ON THAT TOO WITH HOW MANY EXTRA PARTICIPANTS THERE ARE
export function SharedOrSingleProfileImg({

}: ISharedOrSingleProfileImgProps) {


    return (
        <>

            <div className={styles.userIconContainer}>
                {
                    conversationProfilePictureUrl.type === "custom" ?

                        <img
                            src={conversationProfilePictureUrl.groupChatProfileImgUrl}
                            alt={`${conversationName}'s profile picture`}
                            className={styles.singleIcon} />

                        :

                        conversationProfilePictureUrl.participants.length > 1 ?

                            <div className={styles.multiIconContainer}>

                                <img
                                    src={conversationProfilePictureUrl.participants[0]?.profileImgUrl ?? defaultUserImg}
                                    alt={`User Icon: ${conversationName}`}
                                    className={styles.multiIcon}
                                />

                                <div className={styles.participantsNumber}>
                                    {`+${conversationProfilePictureUrl.participants.length - 1}`}
                                </div>

                            </div>

                            :

                            <img
                                src={conversationProfilePictureUrl.participants[0]?.profileImgUrl ?? defaultUserImg}
                                alt={`User Icon: ${conversationName}`}
                                className={styles.singleIcon}
                            />
                }
            </div>

        </>
    )
}
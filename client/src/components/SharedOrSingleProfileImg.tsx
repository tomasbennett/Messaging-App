import { IGroupProfileUnion } from "../../../shared/features/conversation/discriminatedUnions/IGroupProfileUnion";
import styles from "./SharedOrSingleProfileImg.module.css";
import defaultUserImg from "../assets/DEFAULT_USER_IMG.png";


type ISharedOrSingleProfileImgProps = {
    groupProfileImgType: IGroupProfileUnion;
}

//INSTEAD JUST DO A BORDER RADIUS 50% AND THEN A NUMBER AT THE BOTTOM RIGHT
//BORDER RADIUS 50% ON THAT TOO WITH HOW MANY EXTRA PARTICIPANTS THERE ARE
export function SharedOrSingleProfileImg({
    groupProfileImgType: conversationProfilePictureUrl
}: ISharedOrSingleProfileImgProps) {


    return (
        <>

            <div className={styles.userIconContainer}>
                {
                    conversationProfilePictureUrl.type === "custom" ?

                        <div className={styles.overflowHiddenContainer}>

                            <img
                                src={conversationProfilePictureUrl.groupChatProfileImgUrl}
                                alt={`Profile picture`}
                                className={styles.singleIcon} />
                                
                        </div>


                        :

                        conversationProfilePictureUrl.participants.length > 1 ?

                            <div className={styles.multiIconContainer}>

                                <div className={styles.overflowHiddenContainer}>

                                    <img
                                        src={conversationProfilePictureUrl.participants[0]?.profileImgUrl ?? defaultUserImg}
                                        alt={`User Icon`}
                                        className={styles.multiIcon}
                                    />

                                </div>

                                <div className={styles.participantsNumber}>
                                    {`+${conversationProfilePictureUrl.participants.length - 1}`}
                                </div>

                            </div>

                            :

                            <div className={styles.overflowHiddenContainer}>

                                <img
                                    src={conversationProfilePictureUrl.participants[0]?.profileImgUrl ?? defaultUserImg}
                                    alt={`User Icon`}
                                    className={styles.singleIcon}
                                />

                            </div>

                }
            </div>

        </>
    )
}
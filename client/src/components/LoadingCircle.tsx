import loadingStyles from "./LoadingCircle.module.css";

type ILoadingCircleProps = {
    width?: string
}

export function LoadingCircle({
    width = "4rem"
}: ILoadingCircleProps) {
    return (
        <>
            <div style={
                {width: width}
            } className={loadingStyles.loader}></div>
        </>
    )
}
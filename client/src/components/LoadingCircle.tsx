import loadingStyles from "./LoadingCircle.module.css";

type ILoadingCircleProps = {
    height?: string
}

export function LoadingCircle({
    height = "4rem",
}: ILoadingCircleProps) {
    return (
        <>
            <div style={
                {height: height}
            } className={loadingStyles.loader}></div>
        </>
    )
}
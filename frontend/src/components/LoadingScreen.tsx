export default function LoadingScreen() {
    return (
    <div className="flex flex-col gap-3 items-center justify-center min-h-screen bg-background-primary">
        <div className="ml-4 w-8 h-8 border-3 border-t-4 border-neutral-medium border-t-transparent rounded-full animate-spin"></div>
        <div className="text-neutral-medium">Loading...</div>
    </div>
    );
}
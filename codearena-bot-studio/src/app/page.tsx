import { BotStudioWorkspace } from '@/components/workspace/BotStudioWorkspace';

export const dynamic = 'force-dynamic';

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-8 lg:p-24 bg-zinc-950 text-white">
            <header className="z-10 w-full max-w-7xl items-center justify-between font-mono text-sm lg:flex mb-8">
                <p className="flex w-full justify-center lg:justify-start border-b border-gray-300 pb-6 pt-8 backdrop-blur-2xl lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-zinc-800/30 lg:p-4">
                    CodeArena Bot Studio&nbsp;
                    <code className="font-mono font-bold">READY</code>
                </p>
            </header>

            <div className="relative flex flex-col place-items-center gap-8 w-full">
                <BotStudioWorkspace />
            </div>
        </main>
    );
}

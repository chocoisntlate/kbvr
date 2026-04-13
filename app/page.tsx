import ButtonsBar from "@/features/display/ButtonsBar";
import { KeyboardPanel } from "@/features/display/InfoDisplay";
import { Keyboard } from "@/features/keyboard/Keyboard";
import { KeyboardContextProvider } from "@/features/keyboard/KeyboardContext";

export default function Home() {
  return (
    <main className="overflow-hidden p-2 flex flex-col items-center gap-4 my-4">
      <KeyboardContextProvider>
        <KeyboardPanel />
        <div>
          <ButtonsBar />
          <Keyboard />
        </div>
      </KeyboardContextProvider>
    </main>
  );
}
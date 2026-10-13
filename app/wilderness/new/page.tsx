import { ConsentStart } from "@/components/session-workspace";
import { Header, Panel, Shell } from "@/components/ui";

export default function NewSessionPage() {
  return (
    <Shell>
      <Header />
      <Panel className="mx-auto w-full max-w-2xl">
        <p className="text-xs uppercase tracking-[0.3em] text-wilderness-sage">Consent</p>
        <h2 className="mt-3 text-3xl font-semibold">Before entering</h2>
        <div className="mt-5 space-y-3 text-sm leading-6 text-wilderness-glass">
          <p>You confirm you are 18 or older.</p>
          <p>You understand this is a practice exercise, not pastoral counseling, therapy, medical care, emergency support, or legal advice.</p>
          <p>Transcripts are retained during active practice and wiped when the session reaches verdict, recess, or safety stop.</p>
        </div>
        <ConsentStart />
      </Panel>
    </Shell>
  );
}

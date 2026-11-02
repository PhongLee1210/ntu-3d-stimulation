import { useEffect, useId, useRef, useState, type ReactNode } from "react";

import { buttonClass } from "~/components/ui/button";
import { AlertIcon, CheckIcon, CrossIcon } from "~/components/ui/icons";

import type { Env } from "./bench";
import { CHIP } from "./BenchView";
import { CONFIDENCE_VI, evidenceText, type WhyMenu as Menu } from "./copy";
import {
  ASKS,
  CONFIDENCE,
  EMPTY_SLIP,
  gradeSlip,
  isEmptySlip,
  type Bet,
  type Prediction,
  type Slip,
} from "./guess";
import type { CaseView, RunView } from "./run";

const said = (pass: boolean) => (pass ? "đạt" : "trượt");

function Chip({
  name,
  checked,
  onChange,
  children,
}: {
  name: string;
  checked: boolean;
  onChange: () => void;
  children: ReactNode;
}) {
  return (
    <label className="cursor-pointer">
      <input
        type="radio"
        name={name}
        checked={checked}
        onChange={onChange}
        className="peer sr-only"
      />
      <span className={CHIP}>{children}</span>
    </label>
  );
}

export function GuessSlip({
  env,
  slip,
  onChange,
}: {
  env: Env;
  slip: Slip;
  onChange: (next: Slip) => void;
}) {
  const id = useId();
  const { level } = env;
  const total = level.case_counts.normal + level.case_counts.trap;
  const samples = level.visible_cases;
  const others = Array.from({ length: total - samples.length }, (_, i) => samples.length + i + 1);
  const bet = (caseId: string, next: Bet) =>
    onChange({ ...slip, bets: { ...slip.bets, [caseId]: next } });

  return (
    <section
      aria-label="Đoán trước khi mở ca"
      className="mt-2 space-y-4 rounded-md border border-line p-4"
    >
      <p className="text-sm text-fg-muted">
        Không bắt buộc, không tính sao. Phiếu được chấm khi lượt chạy xong.
      </p>

      <fieldset>
        <legend className="text-sm font-medium">Đạt mấy/{total}?</legend>
        <div className="mt-2 flex flex-wrap gap-1">
          {Array.from({ length: total + 1 }, (_, n) => (
            <Chip
              key={n}
              name={`${id}-count`}
              checked={slip.passed === n}
              onChange={() => onChange({ ...slip, passed: n })}
            >
              {n}
            </Chip>
          ))}
        </div>
      </fieldset>

      {(ASKS[level.id] ?? []).map((ask) => (
        <fieldset key={ask.id} data-ask={ask.id}>
          <legend className="text-sm font-medium">{ask.legend}</legend>
          <div className="mt-2 flex flex-wrap gap-1">
            {ask.options.map((option, index) => (
              <Chip
                key={option}
                name={`${id}-${ask.id}`}
                checked={slip.asks?.[ask.id] === index}
                onChange={() => onChange({ ...slip, asks: { ...slip.asks, [ask.id]: index } })}
              >
                {option}
              </Chip>
            ))}
          </div>
        </fieldset>
      ))}

      {samples.map((sample, index) => {
        const n = index + 1;
        const own = slip.bets[sample.id];
        return (
          <fieldset key={sample.id}>
            <legend className="text-sm font-medium">Câu #{n} · Câu mẫu</legend>
            <p className="mt-1 line-clamp-2 text-sm text-fg-muted">{sample.question}</p>
            <div className="mt-2 flex flex-wrap gap-1">
              {[true, false].map((pass) => (
                <Chip
                  key={String(pass)}
                  name={`${id}-${n}`}
                  checked={own?.pass === pass}
                  onChange={() => bet(sample.id, { pass, confidence: own?.confidence ?? "low" })}
                >
                  {pass ? "Đạt" : "Trượt"}
                </Chip>
              ))}
            </div>
            {own && (
              <fieldset className="mt-2">
                <legend className="text-xs text-fg-muted">
                  Mức chắc <span className="sr-only">câu #{n}</span>
                </legend>
                <div className="mt-1 flex flex-wrap gap-1">
                  {CONFIDENCE.map((confidence) => (
                    <Chip
                      key={confidence}
                      name={`${id}-${n}-sure`}
                      checked={own.confidence === confidence}
                      onChange={() => bet(sample.id, { ...own, confidence })}
                    >
                      {CONFIDENCE_VI[confidence]}
                    </Chip>
                  ))}
                </div>
              </fieldset>
            )}
          </fieldset>
        );
      })}

      {others.length > 0 && (
        <fieldset>
          <legend className="text-sm font-medium">Câu nào trượt?</legend>
          <p className="text-xs text-fg-muted">Câu ẩn và câu bẫy chỉ hiện số.</p>
          <div className="mt-2 flex flex-wrap gap-1">
            {others.map((n) => (
              <label key={n} className="cursor-pointer">
                <input
                  type="checkbox"
                  checked={slip.failing.includes(n)}
                  onChange={(event) =>
                    onChange({
                      ...slip,
                      failing: event.target.checked
                        ? [...slip.failing, n].sort((a, b) => a - b)
                        : slip.failing.filter((m) => m !== n),
                    })
                  }
                  className="peer sr-only"
                />
                <span className={CHIP}>
                  <span className="sr-only">Câu</span> #{n}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <button
        type="button"
        onClick={() => onChange(EMPTY_SLIP)}
        disabled={isEmptySlip(slip)}
        className={buttonClass("inline")}
      >
        Xóa phiếu
      </button>
    </section>
  );
}

const CaseLink = ({ c }: { c: CaseView }) => (
  <a href={`#cau-${c.n}`} className="font-semibold text-brand underline underline-offset-4">
    câu #{c.n}
  </a>
);

export function SlipResult({ slip, run, levelId }: { slip: Slip; run: RunView; levelId: string }) {
  const grade = gradeSlip(slip, run, levelId);
  if (!grade) return null;
  const { count, predictions, surprises, asks } = grade;
  const listed = predictions.filter((p) => !p.right || !p.pass);
  const right = predictions.filter((p) => p.right).length;
  return (
    <section aria-labelledby="wb-guess-result" className="mt-8 max-w-prose">
      <h3 id="wb-guess-result" className="text-lg font-bold">
        Phiếu đoán của bạn
      </h3>
      {count && (
        <p className="mt-2 text-sm tabular-nums">
          Bạn đoán {count.guess} câu đạt; thực tế {count.actual}/{count.total} câu đạt.{" "}
          {count.guess === count.actual
            ? "Khớp."
            : `Lệch ${Math.abs(count.guess - count.actual)} câu.`}
        </p>
      )}
      {asks.map(({ ask, guess, actual }) => (
        <p
          key={ask.id}
          data-ask-result={ask.id}
          data-right={guess === actual}
          className="mt-1 text-sm"
        >
          {ask.legend} Bạn đoán {ask.options[guess]}; thực tế {ask.options[actual]}.{" "}
          {guess === actual ? "Khớp." : "Lệch."}
        </p>
      ))}
      {predictions.length > 0 && (
        <p className="mt-1 text-sm tabular-nums">
          Đoán đúng {right}/{predictions.length} câu đã đoán.
        </p>
      )}
      {listed.length > 0 && (
        <ul className="mt-2 space-y-2 text-sm">
          {listed.map((p) => (
            <li key={p.c.id} className="flex gap-2">
              {p.right ? (
                <CheckIcon className="mt-0.5 size-4 shrink-0 text-success" />
              ) : (
                <CrossIcon className="mt-0.5 size-4 shrink-0 text-danger" />
              )}
              <span>
                <span className="font-semibold">{p.right ? "Đoán đúng" : "Đoán sai"}</span> ·{" "}
                <CaseLink c={p.c} />: bạn đoán {said(p.pass)}
                {p.confidence && ` (${CONFIDENCE_VI[p.confidence].toLowerCase()})`}. Bằng chứng:{" "}
                {evidenceText(p.c)}.
              </span>
            </li>
          ))}
        </ul>
      )}
      {surprises.map((p) => (
        <Surprise key={p.c.id} p={p} />
      ))}
      {grade.unfinished > 0 && (
        <p className="mt-2 text-sm text-fg-muted">
          {grade.unfinished} câu không chạy xong vì phía máy chủ nên không chấm.
        </p>
      )}
    </section>
  );
}

function Surprise({ p }: { p: Prediction }) {
  return (
    <div className="mt-3 rounded-md border border-warning bg-warning-tint p-4 text-sm">
      <p className="flex items-center gap-2 text-base font-semibold">
        <AlertIcon className="size-4 shrink-0" />
        Bất ngờ ở câu #{p.c.n}
      </p>
      <p className="mt-1">
        Bạn chắc câu này sẽ {said(p.pass)}, nhưng nó {said(!p.pass)}.
      </p>
      <p className="mt-1">Bằng chứng từ lượt chạy: {evidenceText(p.c)}.</p>
      <a
        href={`#cau-${p.c.n}`}
        className="mt-1 inline-flex min-h-11 items-center font-semibold underline underline-offset-4"
      >
        Xem bằng chứng ở câu #{p.c.n}
      </a>
    </div>
  );
}

export function WhyMenu({
  c,
  menu,
  turn,
  onAnswer,
  onSkip,
}: {
  c: CaseView | null;
  menu: Menu;
  turn: number;
  onAnswer: (index: number) => void;
  onSkip: () => void;
}) {
  const id = useId();
  const [choice, setChoice] = useState<number | null>(null);
  const feedback = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    if (choice !== null) feedback.current?.focus();
  }, [choice]);
  const size = menu.options.length;
  const order = menu.options.map((_, i) => (i + turn) % size);
  return (
    <fieldset className="mt-3 max-w-prose rounded-md border border-line p-4">
      <legend className="px-1 font-semibold">
        {c ? `Vì sao câu #${c.n} sai?` : "Vì sao lượt này vượt ngân sách?"}
      </legend>
      <p className="text-sm text-fg-muted">
        Chọn một lý do rồi xem chẩn đoán. Chọn sai cũng không sao.
      </p>
      <div className="mt-2 space-y-1">
        {order.map((i) => (
          <label
            key={i}
            className="flex min-h-11 cursor-pointer items-center gap-3 text-sm has-disabled:cursor-default"
          >
            <input
              type="radio"
              name={id}
              checked={choice === i}
              disabled={choice !== null}
              onChange={() => {
                setChoice(i);
                onAnswer(i);
              }}
              className="size-5 shrink-0 accent-brand"
            />
            {menu.options[i]}
          </label>
        ))}
      </div>
      {choice === null ? (
        <button type="button" onClick={onSkip} className={buttonClass("inline", "mt-2")}>
          Xem chẩn đoán luôn
        </button>
      ) : (
        <p ref={feedback} tabIndex={-1} className="mt-2 text-sm font-semibold">
          {choice === 0 ? "Đúng lý do." : `Chưa đúng. Lý do là: ${menu.options[0]}.`}
        </p>
      )}
    </fieldset>
  );
}

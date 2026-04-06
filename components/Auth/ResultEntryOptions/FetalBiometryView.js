import { constraintsFormatting } from "../../settingsComponents/FieldsCreation/data/testUtil";

const parseBiometryValue = (rawValue) => {
  const fallback = { BPD: "", FL: "", HC: "", AC: "" };

  if (!rawValue || typeof rawValue !== "string") {
    return fallback;
  }

  try {
    const parsed = JSON.parse(rawValue);
    if (parsed && typeof parsed === "object") {
      return {
        BPD: parsed.BPD ?? parsed.bpd ?? "",
        FL: parsed.FL ?? parsed.fl ?? "",
        HC: parsed.HC ?? parsed.hc ?? "",
        AC: parsed.AC ?? parsed.ac ?? "",
      };
    }
  } catch (_) {
    // Not JSON, continue with pattern parsing.
  }

  const getToken = (key) => {
    const regex = new RegExp(`${key}\\s*[:=]\\s*([0-9]*\\.?[0-9]+)`, "i");
    const match = rawValue.match(regex);
    return match?.[1] || "";
  };

  return {
    BPD: getToken("BPD"),
    FL: getToken("FL"),
    HC: getToken("HC"),
    AC: getToken("AC"),
  };
};

const calculateHadlockEfW = ({ BPD, FL, HC, AC }) => {
  const bpd = Number(BPD);
  const fl = Number(FL);
  const hc = Number(HC);
  const ac = Number(AC);

  if ([bpd, fl, hc, ac].some((value) => Number.isNaN(value) || value <= 0)) {
    return null;
  }

  const bpdCm = bpd / 10;
  const flCm = fl / 10;
  const hcCm = hc / 10;
  const acCm = ac / 10;

  // Hadlock (BPD, HC, AC, FL) model, output in grams.
  const log10Efw =
    1.3596 +
    0.0064 * hcCm +
    0.0424 * acCm +
    0.174 * flCm +
    0.00061 * bpdCm * acCm -
    0.00386 * acCm * flCm;

  return Math.round(Math.pow(10, log10Efw));
};

export default function FetalBiometryView({ fieldItem, statehandler, index }) {
  const {
    name,
    value,
    units,
    fieldConstraints,
    entrymode = "manual",
  } = fieldItem;

  const parsed = parseBiometryValue(value);
  const efw = calculateHadlockEfW(parsed);

  const handleInputChange = (key, fieldValue) => {
    const updated = {
      ...parsed,
      [key]: fieldValue,
    };

    const event = {
      target: {
        value: JSON.stringify(updated),
      },
    };

    statehandler(event, index);
  };

  return (
    <tr>
      <td>{name}</td>
      <td>
        <div className="d-flex flex-wrap gap-2">
          {[
            { key: "BPD", label: "BPD" },
            { key: "FL", label: "FL" },
            { key: "HC", label: "HC" },
            { key: "AC", label: "AC" },
          ].map((item) => (
            <div key={item.key} style={{ minWidth: "75px" }}>
              <label className="small text-muted d-block mb-1">
                {item.label}
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={parsed[item.key]}
                onChange={(ev) => handleInputChange(item.key, ev.target.value)}
                className="custom-input"
                style={{
                  width: "75px",
                  backgroundColor: "var(--bs-body-bg)",
                  color: "var(--bs-body-color)",
                  borderColor: "var(--bs-border-color)",
                }}
              />
            </div>
          ))}
        </div>
      </td>
      <td>{units || "mm"}</td>
      <td>
        {efw ? (
          <span className="fw-semibold">Hadlock EFW: {efw} g</span>
        ) : (
          <span className="text-muted">Enter BPD, FL, HC, AC</span>
        )}
      </td>
      <td className="pls-d-none">{entrymode}</td>
      <td className="pls-d-none">{constraintsFormatting(fieldConstraints)}</td>
    </tr>
  );
}

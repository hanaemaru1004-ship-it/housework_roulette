import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { TimeSelector } from "@/components/roulette/TimeSelector";

describe("TimeSelector", () => {
  it("選択肢をクリックするとonChangeに分数が渡される", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TimeSelector value={null} onChange={onChange} />);

    await user.click(screen.getByRole("button", { name: "10分" }));

    expect(onChange).toHaveBeenCalledWith(10);
  });

  it("1時間以上の選択肢が表示される", () => {
    render(<TimeSelector value={null} onChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: "1時間以上" })).toBeInTheDocument();
  });

  it("現在選択中の値が押下状態になる", () => {
    render(<TimeSelector value={15} onChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: "15分" })).toHaveAttribute("aria-pressed", "true");
  });
});

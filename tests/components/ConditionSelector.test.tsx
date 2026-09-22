import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ConditionSelector } from "@/components/roulette/ConditionSelector";

describe("ConditionSelector", () => {
  it("選択肢をクリックするとonChangeにコンディションの値が渡される", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ConditionSelector value={null} onChange={onChange} />);

    await user.click(screen.getByRole("button", { name: "かなり疲れた" }));

    expect(onChange).toHaveBeenCalledWith("exhausted");
  });

  it("4つのコンディションがすべて表示される", () => {
    render(<ConditionSelector value={null} onChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: "元気" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "普通" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "ちょっと疲れた" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "かなり疲れた" })).toBeInTheDocument();
  });
});

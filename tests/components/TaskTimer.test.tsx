import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { TaskTimer } from "@/components/timer/TaskTimer";

vi.mock("@/lib/alarm", () => ({
  playAlarmSound: vi.fn(),
}));

import { playAlarmSound } from "@/lib/alarm";

describe("TaskTimer", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("STARTを押すと00:00からカウントアップする", () => {
    vi.useFakeTimers();
    render(
      <TaskTimer taskName="トイレ掃除" durationMin={1} onComplete={vi.fn()} onCancel={vi.fn()} />,
    );

    expect(screen.getByText("00:00")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "START" }));
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(screen.getByText("00:03")).toBeInTheDocument();
  });

  it("所要時間に達するとアラームが鳴り、その後も完了ボタンが押されるまでカウントを続ける", () => {
    vi.useFakeTimers();
    const onComplete = vi.fn();
    render(
      <TaskTimer taskName="トイレ掃除" durationMin={1} onComplete={onComplete} onCancel={vi.fn()} />,
    );

    fireEvent.click(screen.getByRole("button", { name: "START" }));
    act(() => {
      vi.advanceTimersByTime(60000);
    });

    expect(screen.getByText("01:00")).toBeInTheDocument();
    expect(playAlarmSound).toHaveBeenCalledTimes(1);
    expect(onComplete).not.toHaveBeenCalled(); // 完了ボタンを押すまでは呼ばれない

    // 所要時間を超えてもカウントを続け、アラームは1回だけ鳴る。
    act(() => {
      vi.advanceTimersByTime(10000);
    });
    expect(screen.getByText("01:10")).toBeInTheDocument();
    expect(playAlarmSound).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "完了" }));
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledWith(70);
  });

  it("一時停止するとカウントが止まり、再開すると再び進む", () => {
    vi.useFakeTimers();
    render(
      <TaskTimer taskName="トイレ掃除" durationMin={5} onComplete={vi.fn()} onCancel={vi.fn()} />,
    );

    fireEvent.click(screen.getByRole("button", { name: "START" }));
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(screen.getByText("00:03")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "一時停止" }));
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getByText("00:03")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "再開" }));
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(screen.getByText("00:05")).toBeInTheDocument();
  });

  it("「やっぱりやめる」から確認して中止するとonCancelが呼ばれる", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(
      <TaskTimer taskName="トイレ掃除" durationMin={10} onComplete={vi.fn()} onCancel={onCancel} />,
    );

    await user.click(screen.getByRole("button", { name: "やっぱりやめる" }));
    await user.click(await screen.findByRole("button", { name: "やめる" }));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});

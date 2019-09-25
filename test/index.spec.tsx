import { assert, expect } from "chai";
import { mount } from "enzyme";
import * as React from "react";
import * as sinon from "sinon";
import { setStateCallback } from "../src/index";

type HookType<T> = [T | undefined, React.Dispatch<React.SetStateAction<T | undefined>>];

interface HookDivProps<T> {
  hook: HookType<T>;
}

interface TestProps<T> {
  hook: () => HookType<T>;
}

function HookDiv<T>(props: HookDivProps<T>) {
  return <div />;
}

function HookTest<T>(props: TestProps<T>) {
  const hook = props.hook ? props.hook() : undefined;

  return <HookDiv hook={hook} />;
}

describe("The setStateCallback hook", (): void => {
  afterEach((): void => {
    sinon.restore();
  });

  it("Should not invoke state change callback from initial state", (): void => {
    const callback = sinon.spy();
    const wrapper = mount(<HookTest hook={() => setStateCallback(5, callback)} />);

    const { hook } = wrapper.find(HookDiv).props() as HookDivProps<number>;
    const [value, setValue] = hook;

    expect(value).to.equal(5);
    expect(setValue).to.be.a("function");
    expect(callback.called).to.be.false;
  });

  /*
  it("Should invoke state change callback for state changes after initial state", (): void => {
    const callbackSpy = sinon.spy();
    const wrapper = mount(<HookTest value={5} onClick={() => 5} onChange={callbackSpy} />);

    wrapper.setProps({ value: 10 });
    wrapper.update();

    assert.equal(wrapper.text(), "10");
    assert.isTrue(callbackSpy.calledOnce);
    assert.isTrue(callbackSpy.calledWith(10));

    wrapper.setProps({ value: 15 });
    wrapper.update();

    assert.equal(wrapper.text(), "15");
    assert.isTrue(callbackSpy.calledTwice);
    assert.isTrue(callbackSpy.calledWith(15));
  });
  */
});

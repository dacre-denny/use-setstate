import { expect } from "chai";
import { mount } from "enzyme";
import * as React from "react";
import * as sinon from "sinon";
import { setStateCallback } from "../src/index";
import { tick } from "./async";

type HookType<T> = [T | undefined, React.Dispatch<React.SetStateAction<T | undefined>>];

interface HookDivProps<T> {
  hook: HookType<T>;
}

const HookDiv = <T extends any>(_: HookDivProps<T>) => <div />;

const HookWrapper = <T extends any>(props: { hook: () => HookType<T> }) => <HookDiv hook={props.hook ? props.hook() : undefined} />;

describe("The setStateCallback hook", (): void => {
  afterEach((): void => {
    sinon.restore();
  });

  it("Should return hook if no initial variables provided", async (): Promise<void> => {
    const callback = sinon.spy();
    const wrapper = mount(<HookWrapper hook={() => setStateCallback()} />);

    const { hook } = wrapper.find(HookDiv).props() as HookDivProps<number>;
    const [value, setValue] = hook;

    expect(hook).to.be.a("array");
    expect(hook).to.have.lengthOf(2);

    expect(value).to.be.undefined;
    expect(setValue).to.be.a("function");
  });

  it("Should return array type with two values", async (): Promise<void> => {
    const callback = sinon.spy();
    const wrapper = mount(<HookWrapper hook={() => setStateCallback(5, callback)} />);

    const { hook } = wrapper.find(HookDiv).props() as HookDivProps<number>;
    const [value, setValue] = hook;

    expect(hook).to.be.a("array");
    expect(hook).to.have.lengthOf(2);

    expect(value).to.be.a("number");
    expect(setValue).to.be.a("function");
  });

  it("Should not invoke state change callback from initial state", async (): Promise<void> => {
    const callback = sinon.spy();
    const wrapper = mount(<HookWrapper hook={() => setStateCallback(5, callback)} />);

    const { hook } = wrapper.find(HookDiv).props() as HookDivProps<number>;
    const [value, setValue] = hook;

    expect(value).to.equal(5);
    expect(setValue).to.be.a("function");
    expect(callback.called).to.be.false;
  });

  it("Should invoke state change callback for state changes after initial state", async (): Promise<void> => {
    const callback = sinon.spy();
    const wrapper = mount(<HookWrapper hook={() => setStateCallback(5, callback)} />);

    let { hook } = wrapper.find(HookDiv).props() as HookDivProps<number>;
    let [value, setValue] = hook;

    expect(value).to.equal(value);
    expect(setValue).to.be.a("function");
    expect(callback.called).to.be.false;

    setValue(10);

    await tick();

    ({ hook } = wrapper.find(HookDiv).props() as HookDivProps<number>);
    [value, setValue] = hook;

    expect(value).to.equal(value);
    expect(setValue).to.be.a("function");
    expect(callback.called).to.be.true;
  });

  /*
  it("Should invoke state change callback for state changes after initial state", async (): Promise<void> => {
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

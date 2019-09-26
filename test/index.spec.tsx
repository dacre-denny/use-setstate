import { expect } from "chai";
import { mount } from "enzyme";
import * as React from "react";
import * as sinon from "sinon";
import { useSetState } from "../src/index";
import { tickUpdate } from "./async";
import { TypedFunction, TypedValue, HookType } from "../src/helpers";

interface HookDivProps<T> {
  hook: HookType<T>;
}

interface HookWrapperProps<T> {
  hookProvider: TypedFunction<void, HookType<T>>;
}

const HookDiv: React.SFC<HookDivProps<TypedValue>> = (): React.ReactElement => <div />;

const HookWrapper: React.SFC<HookWrapperProps<TypedValue>> = (props): React.ReactElement => (
  <HookDiv hook={props.hookProvider ? props.hookProvider() : undefined} />
);

const validateHook = <T extends TypedValue>(hook: HookType<T>, initialValue: T): void => {
  expect(hook).to.be.a("array");
  expect(hook).to.have.lengthOf(2);

  const [value, setValue] = hook;

  expect(value).to.equal(initialValue);
  expect(setValue).to.be.a("function");
};

describe("The setStateCallback hook", async (): Promise<void> => {
  afterEach(
    async (): Promise<void> => {
      sinon.restore();
    }
  );

  it("Should return valid hook if no initial value and no state change callback provided", async (): Promise<void> => {
    const warn = sinon.stub(console, "warn");
    const wrapper = mount(<HookWrapper hookProvider={(): HookType<number> => useSetState()} />);

    let { hook } = wrapper.find(HookDiv).props() as HookDivProps<number>;
    const [, setValue] = hook;

    validateHook(hook, undefined);
    expect(warn.called).to.be.false;

    setValue(1);
    await tickUpdate(wrapper);

    ({ hook } = wrapper.find(HookDiv).props() as HookDivProps<number>);
    validateHook(hook, 1);
    expect(warn.called).to.be.false;
  });

  it("Should return valid hook with state value matching initial state value provided", async (): Promise<void> => {
    const warn = sinon.stub(console, "warn");
    const wrapper = mount(<HookWrapper hookProvider={(): HookType<string> => useSetState("foo")} />);

    let { hook } = wrapper.find(HookDiv).props() as HookDivProps<string>;
    const [, setValue] = hook;

    validateHook(hook, "foo");
    expect(warn.called).to.be.false;

    setValue("bar");
    await tickUpdate(wrapper);

    ({ hook } = wrapper.find(HookDiv).props() as HookDivProps<string>);
    validateHook(hook, "bar");
    expect(warn.called).to.be.false;
  });

  it("Should return valid hook with state value matching result of initial value callback", async (): Promise<void> => {
    const warn = sinon.stub(console, "warn");
    const wrapper = mount(<HookWrapper hookProvider={(): HookType<string> => useSetState((): string => "bar")} />);

    let { hook } = wrapper.find(HookDiv).props() as HookDivProps<string>;
    const [, setValue] = hook;

    validateHook(hook, "bar");
    expect(warn.called).to.be.false;

    setValue("foo");
    await tickUpdate(wrapper);

    ({ hook } = wrapper.find(HookDiv).props() as HookDivProps<string>);
    validateHook(hook, "foo");
    expect(warn.called).to.be.false;
  });

  it("Should log one warning if provided state change callback is not a function", async (): Promise<void> => {
    const callback = ("notFunction()" as unknown) as TypedFunction<number, void>;
    const warn = sinon.stub(console, "warn");
    const wrapper = mount(<HookWrapper hookProvider={(): HookType<undefined | number> => useSetState(undefined, callback)} />);

    const { hook } = wrapper.find(HookDiv).props() as HookDivProps<number>;
    const [, setValue] = hook;

    validateHook(hook, undefined);
    expect(warn.called).to.be.true;
    expect(warn.calledWith(`useSetState: function type for callback argument expected. Found callback of type "string"`)).to.be.true;

    setValue(5);
    await tickUpdate(wrapper);

    expect(warn.calledOnce).to.be.true;

    setValue(10);
    await tickUpdate(wrapper);

    expect(warn.calledOnce).to.be.true;
  });

  it("Should return valid hook if undefined initial value and state change callback provided", async (): Promise<void> => {
    const callback = sinon.spy();
    const warn = sinon.stub(console, "warn");
    const wrapper = mount(<HookWrapper hookProvider={(): HookType<number> => useSetState(undefined, callback)} />);

    const { hook } = wrapper.find(HookDiv).props() as HookDivProps<number>;

    validateHook(hook, undefined);
    expect(warn.called).to.be.false;
    expect(callback.called).to.be.false;
  });

  it("Should only invoke state change callback for state changes after state setter is called", async (): Promise<void> => {
    const callback = sinon.spy();
    const warn = sinon.stub(console, "warn");
    const wrapper = mount(<HookWrapper hookProvider={(): HookType<number> => useSetState(5, callback)} />);

    let { hook } = wrapper.find(HookDiv).props() as HookDivProps<number>;
    let [, setValue] = hook;

    validateHook(hook, 5);
    expect(warn.called).to.be.false;

    setValue(10);
    await tickUpdate(wrapper);

    ({ hook } = wrapper.find(HookDiv).props() as HookDivProps<number>);
    [, setValue] = hook;

    validateHook(hook, 10);
    expect(warn.called).to.be.false;
    expect(callback.calledOnce).to.be.true;
    expect(callback.calledWith(10)).to.be.true;

    setValue(15);
    await tickUpdate(wrapper);

    ({ hook } = wrapper.find(HookDiv).props() as HookDivProps<number>);
    [, setValue] = hook;

    validateHook(hook, 15);
    expect(warn.called).to.be.false;
    expect(callback.calledTwice).to.be.true;
    expect(callback.calledWith(15)).to.be.true;
  });
});

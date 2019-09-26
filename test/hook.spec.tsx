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

  expect(value).to.deep.equal(initialValue);
  expect(setValue).to.be.a("function");
};

describe("the hook module", async (): Promise<void> => {
  afterEach(
    async (): Promise<void> => {
      sinon.restore();
    }
  );

  describe("hook behavior when different arguments specified", (): void => {
    it("should return valid hook when no initial value and no state change callback provided", async (): Promise<void> => {
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

    it("should return valid hook with state value matching initial state value", async (): Promise<void> => {
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

    it("should return valid hook with state value matching result of initial value callback", async (): Promise<void> => {
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

    it("should log one warning if state change callback is not a function", async (): Promise<void> => {
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

    it("should return valid hook if state change callback specified with undefined initial value", async (): Promise<void> => {
      const callback = sinon.spy();
      const warn = sinon.stub(console, "warn");
      const wrapper = mount(<HookWrapper hookProvider={(): HookType<number> => useSetState(undefined, callback)} />);

      const { hook } = wrapper.find(HookDiv).props() as HookDivProps<number>;

      validateHook(hook, undefined);
      expect(warn.called).to.be.false;
      expect(callback.called).to.be.false;
    });
  });

  describe("state change callback behavior", (): void => {
    it("should not invoke state change callback when first initialized", async (): Promise<void> => {
      const callback = sinon.spy();
      const warn = sinon.stub(console, "warn");
      const wrapper = mount(<HookWrapper hookProvider={(): HookType<number> => useSetState(5, callback)} />);

      const { hook } = wrapper.find(HookDiv).props() as HookDivProps<number>;

      validateHook(hook, 5);
      expect(warn.called).to.be.false;
      expect(callback.called).to.be.false;
    });

    it("should invoke state change callback after state setter called", async (): Promise<void> => {
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

    it("should invoke state change callback after state setter called with updater", async (): Promise<void> => {
      const callback = sinon.spy();
      const warn = sinon.stub(console, "warn");
      const wrapper = mount(<HookWrapper hookProvider={(): HookType<number> => useSetState(5, callback)} />);

      let { hook } = wrapper.find(HookDiv).props() as HookDivProps<number>;
      let [, setValue] = hook;

      validateHook(hook, 5);
      expect(warn.called).to.be.false;

      setValue((): number => 10);
      await tickUpdate(wrapper);

      ({ hook } = wrapper.find(HookDiv).props() as HookDivProps<number>);
      [, setValue] = hook;

      validateHook(hook, 10);
      expect(warn.called).to.be.false;
      expect(callback.calledOnce).to.be.true;
      expect(callback.calledWith(10)).to.be.true;

      setValue((): number => 15);
      await tickUpdate(wrapper);

      ({ hook } = wrapper.find(HookDiv).props() as HookDivProps<number>);
      [, setValue] = hook;

      validateHook(hook, 15);
      expect(warn.called).to.be.false;
      expect(callback.calledTwice).to.be.true;
      expect(callback.calledWith(15)).to.be.true;
    });
  });

  describe("state change behavior via updater function", (): void => {
    it("should invoke updater passed to state setter and update hook state to updaters result", async (): Promise<void> => {
      const callback = sinon.spy();
      const updater = sinon.fake((n: number): number => n + 7);
      const warn = sinon.stub(console, "warn");
      const wrapper = mount(<HookWrapper hookProvider={(): HookType<number> => useSetState(5, callback)} />);

      let { hook } = wrapper.find(HookDiv).props() as HookDivProps<number>;
      let [, setValue] = hook;

      validateHook(hook, 5);
      expect(warn.called).to.be.false;

      setValue(updater);
      await tickUpdate(wrapper);

      ({ hook } = wrapper.find(HookDiv).props() as HookDivProps<number>);
      [, setValue] = hook;

      validateHook(hook, 12);
      expect(warn.called).to.be.false;
      expect(callback.calledOnce).to.be.true;
      expect(callback.calledWith(12)).to.be.true;
      expect(updater.calledOnce).to.be.true;
      expect(updater.calledWith(5)).to.be.true;

      setValue(updater);
      await tickUpdate(wrapper);

      ({ hook } = wrapper.find(HookDiv).props() as HookDivProps<number>);
      [, setValue] = hook;

      validateHook(hook, 19);
      expect(warn.called).to.be.false;
      expect(callback.calledTwice).to.be.true;
      expect(callback.calledWith(19)).to.be.true;
      expect(updater.calledTwice).to.be.true;
      expect(updater.calledWith(12)).to.be.true;
    });

    it("should invoke multiple updaters passed to state setter and update state to result of each updater", async (): Promise<void> => {
      const callback = sinon.spy();
      const updaterToUndefined = sinon.fake((): undefined => undefined);
      const updaterToFoo = sinon.fake((): string => "foo");
      const warn = sinon.stub(console, "warn");
      const wrapper = mount(<HookWrapper hookProvider={(): HookType<TypedValue> => useSetState(5, callback)} />);

      let { hook } = wrapper.find(HookDiv).props() as HookDivProps<TypedValue>;
      let [, setValue] = hook;

      validateHook(hook, 5);
      expect(warn.called).to.be.false;

      setValue(updaterToUndefined);
      await tickUpdate(wrapper);

      ({ hook } = wrapper.find(HookDiv).props() as HookDivProps<TypedValue>);
      [, setValue] = hook;

      validateHook(hook, undefined);
      expect(warn.called).to.be.false;
      expect(callback.calledOnce).to.be.true;
      expect(callback.calledWith(undefined)).to.be.true;
      expect(updaterToUndefined.calledOnce).to.be.true;
      expect(updaterToUndefined.calledWith(5)).to.be.true;

      setValue(updaterToFoo);
      await tickUpdate(wrapper);

      ({ hook } = wrapper.find(HookDiv).props() as HookDivProps<number>);
      [, setValue] = hook;

      validateHook(hook, "foo");
      expect(warn.called).to.be.false;
      expect(callback.calledTwice).to.be.true;
      expect(callback.calledWith(undefined)).to.be.true;
      expect(updaterToFoo.calledOnce).to.be.true;
      expect(updaterToFoo.calledWith(undefined)).to.be.true;
    });

    it("should not merge existing object state with new object state returned by updater", async (): Promise<void> => {
      const callback = sinon.spy();
      const obj = { foo: "bar" };
      const warn = sinon.stub(console, "warn");
      const wrapper = mount(<HookWrapper hookProvider={(): HookType<TypedValue> => useSetState(obj, callback)} />);

      let { hook } = wrapper.find(HookDiv).props() as HookDivProps<TypedValue>;
      let [, setValue] = hook;

      validateHook(hook, obj);
      expect(warn.called).to.be.false;

      setValue((): object => ({ hello: "goodbye" }));
      await tickUpdate(wrapper);

      ({ hook } = wrapper.find(HookDiv).props() as HookDivProps<TypedValue>);
      [, setValue] = hook;

      validateHook(hook, {
        hello: "goodbye"
      });

      expect(warn.called).to.be.false;
      expect(callback.calledOnce).to.be.true;
      expect(
        callback.calledWith({
          hello: "goodbye"
        })
      ).to.be.true;
    });
  });

  describe("state merge behavior", (): void => {
    it("should replace non-object state with new state of subsequently set object type", async (): Promise<void> => {
      const callback = sinon.spy();
      const obj = { foo: "bar" };
      const warn = sinon.stub(console, "warn");
      const wrapper = mount(<HookWrapper hookProvider={(): HookType<TypedValue> => useSetState(5, callback)} />);

      let { hook } = wrapper.find(HookDiv).props() as HookDivProps<TypedValue>;
      let [, setValue] = hook;

      validateHook(hook, 5);
      expect(warn.called).to.be.false;

      setValue(obj);
      await tickUpdate(wrapper);

      ({ hook } = wrapper.find(HookDiv).props() as HookDivProps<TypedValue>);
      [, setValue] = hook;

      validateHook(hook, obj);
      expect(warn.called).to.be.false;
      expect(callback.calledOnce).to.be.true;
      expect(callback.calledWith(obj)).to.be.true;
    });

    it("should replace object state with new state of subsequently set non-object type", async (): Promise<void> => {
      const callback = sinon.spy();
      const obj = { foo: "bar" };
      const warn = sinon.stub(console, "warn");
      const wrapper = mount(<HookWrapper hookProvider={(): HookType<TypedValue> => useSetState(obj, callback)} />);

      let { hook } = wrapper.find(HookDiv).props() as HookDivProps<TypedValue>;
      let [, setValue] = hook;

      validateHook(hook, obj);
      expect(warn.called).to.be.false;

      setValue("foo");
      await tickUpdate(wrapper);

      ({ hook } = wrapper.find(HookDiv).props() as HookDivProps<TypedValue>);
      [, setValue] = hook;

      validateHook(hook, "foo");
      expect(warn.called).to.be.false;
      expect(callback.calledOnce).to.be.true;
      expect(callback.calledWith("foo")).to.be.true;
    });

    it("should merge existing object state with subsequently set object state (and overwrite colliding keys)", async (): Promise<void> => {
      const callback = sinon.spy();
      const obj = { foo: "bar", hello: 1, world: [] };
      const warn = sinon.stub(console, "warn");
      const wrapper = mount(<HookWrapper hookProvider={(): HookType<TypedValue> => useSetState(obj, callback)} />);

      let { hook } = wrapper.find(HookDiv).props() as HookDivProps<TypedValue>;
      let [, setValue] = hook;

      validateHook(hook, obj);
      expect(warn.called).to.be.false;

      setValue({ hello: "goodbye" });
      await tickUpdate(wrapper);

      ({ hook } = wrapper.find(HookDiv).props() as HookDivProps<TypedValue>);
      [, setValue] = hook;

      validateHook(hook, {
        foo: "bar",
        hello: "goodbye",
        world: []
      });

      expect(warn.called).to.be.false;
      expect(callback.calledOnce).to.be.true;
      expect(
        callback.calledWith({
          foo: "bar",
          hello: "goodbye",
          world: []
        })
      ).to.be.true;
    });
  });
});

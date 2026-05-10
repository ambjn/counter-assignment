import ExpoModulesCore

public class CounterModule: Module {
  public func definition() -> ModuleDefinition {
    Name("Counter")

    Events("onValueChanged")

    Function("getValue") { () -> Int in
      Int(CounterBridge.shared().getValue())
    }

    Function("increment") {
      CounterBridge.shared().increment()
    }

    Function("decrement") {
      CounterBridge.shared().decrement()
    }

    Function("reset") {
      CounterBridge.shared().reset()
    }

    OnCreate {
      CounterBridge.shared().setOnChange { [weak self] value in
        self?.sendEvent("onValueChanged", ["value": Int(value)])
      }
    }

    OnDestroy {
      CounterBridge.shared().invalidate()
    }
  }
}

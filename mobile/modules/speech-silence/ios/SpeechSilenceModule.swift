import AudioToolbox
import ExpoModulesCore

public class SpeechSilenceModule: Module {
  private var checkers: [MuteChecker] = []

  public func definition() -> ModuleDefinition {
    Name("SpeechSilence")

    AsyncFunction("isSilentModeEnabled") { (promise: Promise) in
      #if targetEnvironment(simulator)
      promise.resolve(false)
      #else
      do {
        let checker = try MuteChecker()
        self.checkers.append(checker)
        checker.onComplete = { [weak self] muted in
          promise.resolve(muted)
          DispatchQueue.main.async {
            self?.checkers.removeAll { $0 === checker }
          }
        }
        checker.check()
      } catch {
        promise.resolve(false)
      }
      #endif
    }
  }
}

/// Plays a short silent UI sound. iOS skips it when the silent switch is on and
/// calls the completion almost immediately; otherwise the sound runs its full length.
private final class MuteChecker {
  var onComplete: ((Bool) -> Void)?

  private var soundId: SystemSoundID = 0
  private var startedAt: Date?

  init() throws {
    guard let url = MuteChecker.soundURL() else {
      throw MuteCheckerError.missingSound
    }

    let status = AudioServicesCreateSystemSoundID(url as CFURL, &soundId)
    guard status == kAudioServicesNoError else {
      throw MuteCheckerError.soundId(status)
    }

    var isUISound: UInt32 = 1
    AudioServicesSetProperty(
      kAudioServicesPropertyIsUISound,
      UInt32(MemoryLayout.size(ofValue: soundId)),
      &soundId,
      UInt32(MemoryLayout.size(ofValue: isUISound)),
      &isUISound
    )

    AudioServicesAddSystemSoundCompletion(
      soundId,
      CFRunLoopGetMain(),
      CFRunLoopMode.defaultMode.rawValue,
      { _, clientData in
        guard let clientData else { return }
        Unmanaged<MuteChecker>.fromOpaque(clientData).takeUnretainedValue().completed()
      },
      Unmanaged.passUnretained(self).toOpaque()
    )
  }

  deinit {
    AudioServicesRemoveSystemSoundCompletion(soundId)
    AudioServicesDisposeSystemSoundID(soundId)
  }

  func check() {
    startedAt = Date()
    AudioServicesPlaySystemSound(soundId)
  }

  private func completed() {
    let elapsed = Date().timeIntervalSince(startedAt ?? Date())
    let callback = onComplete
    onComplete = nil
    callback?(elapsed <= 0.15)
  }

  private static func soundURL() -> URL? {
    let candidates = [Bundle(for: SpeechSilenceModule.self), Bundle.main]
    for bundle in candidates {
      if let url = bundle.url(forResource: "MuteChecker", withExtension: "wav") {
        return url
      }
    }
    return nil
  }
}

private enum MuteCheckerError: Error {
  case missingSound
  case soundId(OSStatus)
}

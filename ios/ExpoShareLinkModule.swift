import ExpoModulesCore
import LinkPresentation

struct ShareOptions: Record {
  @Field var url: String
  @Field var title: String?
  @Field var iconUri: String?
  @Field var dialogTitle: String?
}

public class ExpoShareLinkModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ExpoShareLink")

    Function("isAvailable") { () -> Bool in
      true
    }

    AsyncFunction("shareAsync") { (options: ShareOptions, promise: Promise) in
      guard let url = URL(string: options.url) else {
        throw InvalidUrlException(options.url)
      }

      // Icon bytes may come from disk or the network; load them off the main
      // thread and only present once they are ready so the header has the
      // image on its first frame.
      DispatchQueue.global(qos: .userInitiated).async {
        let icon = Self.loadImage(from: options.iconUri)
        DispatchQueue.main.async {
          guard let presenter = self.appContext?.utilities?.currentViewController() else {
            promise.reject(NoPresenterException())
            return
          }
          let item = LinkActivityItem(url: url, title: options.title, icon: icon)
          let controller = UIActivityViewController(activityItems: [item], applicationActivities: nil)
          controller.completionWithItemsHandler = { activity, completed, _, _ in
            promise.resolve([
              "completed": completed,
              "activityType": activity?.rawValue as Any,
            ])
          }
          if let popover = controller.popoverPresentationController {
            popover.sourceView = presenter.view
            popover.sourceRect = CGRect(
              x: presenter.view.bounds.midX,
              y: presenter.view.bounds.midY,
              width: 0,
              height: 0
            )
            popover.permittedArrowDirections = []
          }
          presenter.present(controller, animated: true)
        }
      }
    }
  }

  private static func loadImage(from uri: String?) -> UIImage? {
    guard let uri, !uri.isEmpty else { return nil }
    if let url = URL(string: uri), url.scheme != nil {
      if url.isFileURL {
        return UIImage(contentsOfFile: url.path)
      }
      guard let data = try? Data(contentsOf: url) else { return nil }
      return UIImage(data: data)
    }
    return UIImage(contentsOfFile: uri)
  }
}

private final class LinkActivityItem: NSObject, UIActivityItemSource {
  private let url: URL
  private let title: String?
  private let icon: UIImage?

  init(url: URL, title: String?, icon: UIImage?) {
    self.url = url
    self.title = title
    self.icon = icon
  }

  func activityViewControllerPlaceholderItem(_ controller: UIActivityViewController) -> Any {
    url
  }

  func activityViewController(
    _ controller: UIActivityViewController,
    itemForActivityType activityType: UIActivity.ActivityType?
  ) -> Any? {
    url
  }

  func activityViewController(
    _ controller: UIActivityViewController,
    subjectForActivityType activityType: UIActivity.ActivityType?
  ) -> String {
    title ?? ""
  }

  func activityViewControllerLinkMetadata(_ controller: UIActivityViewController) -> LPLinkMetadata? {
    let metadata = LPLinkMetadata()
    metadata.originalURL = url
    metadata.url = url
    metadata.title = title
    if let icon {
      metadata.iconProvider = NSItemProvider(object: icon)
      metadata.imageProvider = NSItemProvider(object: icon)
    }
    return metadata
  }
}

internal final class InvalidUrlException: GenericException<String> {
  override var reason: String {
    "'\(param)' is not a valid URL"
  }
}

internal final class NoPresenterException: Exception {
  override var reason: String {
    "There is no view controller to present the share sheet from"
  }
}

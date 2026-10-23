// Garbage monitoring on the edge: the Team Phoenix QIDK project, and the
// separate YOLO11s-seg vs UNet comparison in the GVP repo. Their numbers
// come from different experiments and are kept apart on purpose.

import { html } from "../lib/html.mjs";
import { intro, shutterImg, sec, field, codePane, prose, points, decisions, stack, table, fig, clip } from "../lib/parts.mjs";

export default function ({ root, project }) {
  const body = html`
${intro({
  project,
  kicker: "Team Phoenix, IIIT Hyderabad, Nov 2025",
  lede: "City cameras watch the corners where garbage gets dumped. This system segments every frame into waste, people and animals on a Qualcomm dev kit, then reports how much of the scene is covered, without sending video anywhere.",
  meta: [
    ["Team", "Krishna Kaundinya Peddibhotla, Nikhith Reddy K, Phanindra Gollapalli and Krithik Kambhampati. Advised by Dr. Sachin Chaudari."],
    ["Hardware", "Qualcomm Intelligent Development Kit (QIDK), and a Raspberry Pi 4 for comparison"],
    ["Built with", "Kotlin, TensorFlow Lite, YOLOv11, Qualcomm AI Hub, Firebase"],
  ],
  links: [
    ...project.repos,
    { label: "Demo video", href: "https://github.com/krithikkambhampati/Garbage-Vulnerable-Points-Monitoring-System/blob/HEAD/Demos/demo.mp4" },
  ],
  visual: shutterImg({
    root, src: "garbage/annotated-street.webp", w: 1154, h: 600,
    alt: "A CCTV frame of a roadside dump with waste polygons in yellow, a person on a scooter and two animals annotated.",
    caption: "One annotated CCTV frame from the training data: waste in yellow, people in green, animals in red.",
  }),
})}

${sec({ title: "The problem", body: html`
  ${prose(
    "Garbage vulnerable points are the spots where waste keeps being dumped. The brief was to watch them with a camera and measure the area and amount of garbage, and how dumping changes over time, on a QIDK board with low enough latency to run continuously.",
    "Measuring area rules out the usual answer. Bounding boxes around irregular piles of rubbish swallow the road around them: on this data, boxes overestimated the garbage area by 65.2%. So the system segments pixels instead of drawing boxes."
  )}
  ${table({
    caption: "Pixels labelled per class, segmentation against bounding boxes (presentation slide 5)",
    head: ["Class", "Segmentation pixels", "Bounding-box pixels"],
    rows: [
      ["Waste", "44,222,559", "over 132 million"],
      ["Person", "4,183,114", "7,897,934"],
      ["Animal", "1,364,056", "2,218,330"],
    ],
    num: [1, 2],
  })}
` })}

${sec({ title: "Data and five models", body: html`
  <div class="p-split">
    <div>
      ${prose(
        "The dataset came from three places: over 1,500 CCTV frames from two dumping spots in the city, provided by the course, over 100 photos taken on campus, and over 100 from the web for variety. The team annotated all of them in Label Studio into three classes.",
        "Five segmentation models were trained through Qualcomm AI Hub and compared on mean IoU and F1. YOLOv11 won, though only narrowly on F1 over YOLOv8. It was chosen for its accuracy together with its speed, memory footprint and support on Qualcomm's NPU."
      )}
      ${table({
        caption: "Model comparison from the project report",
        head: ["Model", "Mean IoU", "F1"],
        rows: [
          ["YOLOv11", "0.75", "0.69"],
          ["YOLOv8", "0.72", "0.69"],
          ["FCN ResNet50", "0.61", "0.66"],
          ["DDRNet23-Slim", "0.50", "0.66"],
          ["U-Net", "0.49", "0.60"],
        ],
        num: [1, 2],
        best: 0,
      })}
    </div>
    ${clip({ root, src: "garbage-runner.mp4", poster: "garbage-runner-poster.webp", label: "The desktop runner segmenting a waste pile with each model in turn.", caption: "From the team's demo video: the desktop runner puts every model on the same image for a side-by-side check." })}
  </div>
` })}

${sec({ title: "On the device", body: html`
  ${clip({ root, src: "garbage-phone.mp4", poster: "garbage-phone-poster.webp", label: "The app on a QIDK device segmenting a photo, then showing coverage and NPU timings.", caption: "From the demo video: picking a photo on the QIDK, segmenting it, and reading back coverage and the NPU's preprocess, inference and post-process times." })}
  <div class="figs">
    ${fig({ root, src: "garbage/qidk-phones.webp", w: 1080, h: 686, alt: "Two QIDK devices running the app with green waste masks.", caption: "The app on QIDK v1 and v2. On average v2's NPU segments an image about 200 ms faster." })}
    ${fig({ root, src: "garbage/android-app.webp", w: 303, h: 638, alt: "The Android app screen with a segmented image, capture buttons and the current delegate NNAPI.", caption: "The app shows the mask, coverage, pixel counts and which accelerator ran it.", cls: "is-phone" })}
  </div>
  ${points([
    "The Kotlin app captures with CameraX or takes a gallery image, letterboxes it to 640 by 640, and runs a memory-mapped YOLOv11 TensorFlow Lite model.",
    "It sets up three interpreters and prefers the GPU delegate, then NNAPI, then the CPU, because accelerator support varies from device to device.",
    "Each result is saved locally as an image and a CSV row, and pushed to Firebase with the coverage, timing, delegate and per-class breakdown. An auto-capture timer keeps it running unattended.",
  ])}
  <div class="p-split is-even">
    ${codePane({ file: "SegmentationHelper.kt", name: "garbage-delegates.kt", start: 86, note: "Three interpreters, one preference order: GPU, then NNAPI, then CPU." })}
    ${codePane({ file: "SegmentationHelper.kt", name: "garbage-decode.kt", start: 456, to: 36, note: "Decoding YOLO's 8,400 candidates, each with class scores and 32 mask coefficients, before non-maximum suppression." })}
  </div>
` })}

${field(html`
${sec({ title: "In the field", body: html`
  <div class="p-split">
    ${fig({ root, src: "garbage/campus-deployment.webp", w: 629, h: 755, alt: "The model's green masks over a dump under trees on campus.", caption: "Deployed on campus and left running for several hours on a continuous power supply." })}
    <div>
      ${prose("The app logged coverage through the evening, from about a quarter to six until nearly eight. The report also timed the whole pipeline on each device.")}
      ${table({
        caption: "Processing time per image (report, table II)",
        head: ["Device", "Time"],
        rows: [
          ["QIDK, NPU", "2,076 ms"],
          ["QIDK, CPU", "2,206 ms"],
          ["Raspberry Pi 4", "17,054 ms"],
        ],
        num: [1],
        best: 0,
      })}
      ${prose("The QIDK came out about eight times faster than the Raspberry Pi 4, which the report puts down to the Pi's older CPU and its lack of optimised ML kernels.")}
    </div>
  </div>
  ${fig({ root, src: "garbage/coverage-over-time.webp", w: 1300, h: 731, alt: "Line plot of garbage coverage against time during the field test, falling from about 15% to a few percent.", caption: "Coverage against time during the field test, in IST, from the team's presentation." })}
` })}
`)}

${sec({ title: "A second experiment", body: html`
  ${prose(
    "The GVP repo carries the work on as a separate, cleaner comparison on about 1,600 images with a fixed 70/15/15 split: an instance model, YOLO11s-seg, against a semantic one, a UNet with a ResNet34 encoder. To score them the same way, YOLO's instance masks are collapsed into a single class mask and both are measured with the same pixel IoU on the test set.",
    "Its numbers are not comparable with the table above: different data, split and metric."
  )}
  ${table({
    caption: "Pixel IoU on the test split (results/comparison_summary.json)",
    head: ["Class", "YOLO11s-seg", "UNet ResNet34"],
    rows: [
      ["Waste", "0.567", "0.648"],
      ["Person", "0.440", "0.335"],
      ["Animal", "0.325", "0.053"],
      ["Mean, without background", "0.444", "0.345"],
    ],
    num: [1, 2],
    best: 3,
  })}
  ${prose("Animals are 0.07% of all pixels, and a plain per-pixel UNet almost never learned them. YOLO, which finds objects first, did far better there. UNet edged ahead on waste, the large dense regions per-pixel classification suits.")}
  <div class="figs">
    ${fig({ root, src: "garbage/yolo-val-predictions.webp", w: 960, h: 550, alt: "YOLO11s-seg predictions on four validation CCTV frames, labelled waste and person with confidence scores.", caption: "YOLO11s-seg on validation frames." })}
    ${fig({ root, src: "garbage/yolo-confusion.webp", w: 1200, h: 900, alt: "Normalised confusion matrix for animal, waste, person and background.", caption: "Normalised confusion matrix: animal 0.78, waste 0.70, person 0.71 on the diagonal." })}
  </div>
  ${codePane({ file: "backend/inference.py", name: "gvp-collapse.py", start: 80, note: "The demo app's API collapses instance masks into one class mask, the same way the comparison does." })}
` })}

${sec({ title: "Decisions the team documented", body: decisions([
  ["Segment, don't box", "Boxes overestimated waste area by 65.2%, and area is the number the project exists to measure.", "Report, section III.B"],
  ["YOLOv11 for the hardware, not the score", "F1 was level, so the choice came down to speed, memory and NPU support on the target hardware.", "Report, section VII.B"],
  ["Three sources of images", "Two fixed CCTV spots would overfit, so campus and web photos were added for different scenes.", "Report, section III.A"],
  ["A fallback chain for accelerators", "GPU, NNAPI and CPU interpreters are all prepared with warm-up runs, and the user can switch between them.", "SegmentationHelper.kt"],
]) })}

${sec({ title: "Built with", body: stack([
  ["Android", "Kotlin, CameraX, TensorFlow Lite with GPU and NNAPI delegates"],
  ["Models", "YOLOv11, YOLOv8, FCN ResNet50, DDRNet23-Slim, U-Net via Qualcomm AI Hub"],
  ["Comparison", "Ultralytics, PyTorch, segmentation-models-pytorch, FastAPI, React"],
  ["Data", "Label Studio, Firebase Realtime Database and Storage"],
]) })}
`;
  return { body, titleSuffix: "edge segmentation on Qualcomm QIDK" };
}

def run_yolo_inference(img_bgr):
    h, w = img_bgr.shape[:2]
    results = _yolo_model.predict(source=img_bgr, verbose=False)
    r = results[0]

    class_mask = np.zeros((h, w), dtype=np.uint8)
    instance_count = {name: 0 for name in CLASS_MAP.values()}

    if r.masks is not None:
        for mask, cls in zip(r.masks.data, r.boxes.cls):
            cls_id = int(cls)
            m = cv2.resize(mask.cpu().numpy(), (w, h))
            class_mask[m > 0.5] = cls_id + 1
            instance_count[CLASS_MAP[cls_id]] += 1

    overlay = _make_overlay(img_bgr, class_mask)
    stats = _compute_stats(class_mask)

export async function compressImageToMaxSize(file: File, maxSizeKB = 200, maxWidth = 1024, maxHeight = 1024): Promise<File> {
    return new Promise((resolve, reject) => {
        if (!file.type.startsWith("image/")) {
            reject(new Error("Not an image file"));
            return;
        }

        const img = new Image();
        const reader = new FileReader();

        reader.onload = (e) => {
            if (!e.target?.result) return reject(new Error("Failed to read file"));
            img.src = e.target.result as string;
        };

        img.onload = () => {
            // Resize maintaining aspect ratio
            let { width, height } = img;
            if (width > maxWidth || height > maxHeight) {
                const ratio = Math.min(maxWidth / width, maxHeight / height);
                width = width * ratio;
                height = height * ratio;
            }

            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            if (!ctx) return reject(new Error("Canvas not supported"));
            ctx.drawImage(img, 0, 0, width, height);

            // Iteratively reduce quality to fit max size
            const compress = (quality: number) => {
                return new Promise<File>((res, rej) => {
                    canvas.toBlob(
                        (blob) => {
                            if (!blob) return rej(new Error("Compression failed"));
                            if (blob.size / 1024 <= maxSizeKB || quality <= 0.1) {
                                res(new File([blob], file.name, { type: file.type }));
                            } else {
                                // reduce quality by 0.05 and retry
                                compress(quality - 0.05).then(res).catch(rej);
                            }
                        },
                        file.type,
                        quality
                    );
                });
            };

            compress(0.9).then(resolve).catch(reject); // start from 90% quality
        };

        img.onerror = (err) => reject(err);

        reader.readAsDataURL(file);
    });
}
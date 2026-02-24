import React, { useState, useRef, useEffect } from "react";
import { useOutletContext } from "react-router";
import { CheckCircle2, ImageIcon, UploadIcon } from "lucide-react";

import {
	PROGRESS_INTERVAL_MS,
	PROGRESS_STEP,
	REDIRECT_DELAY_MS,
} from "../lib/constants";

type UploadProps = {
	onComplete: (base64: string) => void;
};

const Upload = ({ onComplete }: UploadProps) => {
	const [file, setFile] = useState<File | null>(null);
	const [isDragging, setIsDragging] = useState(false);
	const [progress, setProgress] = useState(0);
	const [base64Data, setBase64Data] = useState<string | null>(null);

	const intervalRef = useRef<number | null>(null);
	const timeoutRef = useRef<number | null>(null);
	const completedRef = useRef(false);
	const isMountedRef = useRef(true);

	const { isSignedIn } = useOutletContext<AuthContext>();

	// -------------------------
	// Cleanup on unmount
	// -------------------------
	useEffect(() => {
		return () => {
			isMountedRef.current = false;

			if (intervalRef.current) {
				clearInterval(intervalRef.current);
			}

			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, []);

	// -------------------------
	// Start Progress Interval
	// -------------------------
	useEffect(() => {
		if (!base64Data) return;

		// reset completion guard
		completedRef.current = false;

		intervalRef.current = window.setInterval(() => {
			setProgress((prev) => {
				const next = prev + PROGRESS_STEP;
				return next >= 100 ? 100 : next;
			});
		}, PROGRESS_INTERVAL_MS);

		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
			}
		};
	}, [base64Data]);

	// -------------------------
	// Detect Completion
	// -------------------------
	useEffect(() => {
		if (
			progress === 100 &&
			base64Data &&
			!completedRef.current &&
			isMountedRef.current
		) {
			completedRef.current = true;

			if (intervalRef.current) {
				clearInterval(intervalRef.current);
			}

			timeoutRef.current = window.setTimeout(() => {
				if (isMountedRef.current) {
					onComplete(base64Data);
				}
			}, REDIRECT_DELAY_MS);
		}
	}, [progress, base64Data, onComplete]);

	// -------------------------
	// Process File
	// -------------------------
	const processFile = (selectedFile: File) => {
		if (!isSignedIn) return;

		const reader = new FileReader();
		reader.onerror =() =>{
			setFile(null)
			setProgress(0)
		}

		reader.onload = () => {
			setProgress(0);
			setBase64Data(reader.result as string);
		};

		reader.readAsDataURL(selectedFile);
	};

	// -------------------------
	// Input Change
	// -------------------------
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (!isSignedIn) return;

		const selectedFile = e.target.files?.[0];
		if (!selectedFile) return;

		setFile(selectedFile);
		processFile(selectedFile);
	};

	// -------------------------
	// Drag Handlers
	// -------------------------
	const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		if (!isSignedIn) return;
		setIsDragging(true);
	};

	const handleDragLeave = () => {
		setIsDragging(false);
	};

	const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		if (!isSignedIn) return;
		setIsDragging(false);

		const droppedFile = e.dataTransfer.files?.[0];
		if (!droppedFile) return;
		const allowedTypes = ['image/jpeg', 'image/png'];
		if(droppedFile && allowedTypes.includes(droppedFile.type)) {
			setFile(droppedFile);
			processFile(droppedFile);
		}
	};

	return (
		<div className="upload">
			{!file ? (
				<div
					className={`dropzone ${isDragging ? "is-dragging" : ""}`}
					onDragOver={handleDragOver}
					onDragLeave={handleDragLeave}
					onDrop={handleDrop}
				>
					<input
						type="file"
						className="drop-input"
						accept=".jpg, .jpeg, .png"
						disabled={!isSignedIn}
						onChange={handleChange}
					/>

					<div className="dropzone-content">
						<div className="drop-icon">
							<UploadIcon size={20} />
						</div>

						<p>
							{isSignedIn
								? "Click to upload or just drag and drop"
								: "Sign in or sign up with Puter to upload"}
						</p>

						<p className="help">Maximum file size 50 MB.</p>
					</div>
				</div>
			) : (
				<div className="upload-status">
					<div className="status-content">
						<div className="status-icon">
							{progress === 100 ? (
								<CheckCircle2 className="check" />
							) : (
								<ImageIcon className="image" />
							)}
						</div>

						<h3>{file.name}</h3>

						<div className="progress">
							<div
								className="bar"
								style={{ width: `${progress}%` }}
							/>

							<p className="status-text">
								{progress < 100
									? "Analyzing Floor Plan..."
									: "Redirecting..."}
							</p>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default Upload;
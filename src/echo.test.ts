import { ErrorCode, McpError, type ToolSchema } from "@modelcontextprotocol/sdk/types.js";
import { describe, expect, it } from "vitest";
import { z } from "zod";

const EchoParamsSchema = z
	.object({
		text: z.string().min(1).describe("Text to echo back"),
		uppercase: z
			.boolean()
			.optional()
			.describe("If true, return the text in uppercase"),
	})
	.describe("Parameters for echo tool");

async function handleListTools() {
	return {
		tools: [
			{
				name: "echo",
				description: "Echo back input text",
				inputSchema: z.toJSONSchema(EchoParamsSchema) as z.infer<typeof ToolSchema.shape.inputSchema>,
			},
		],
	};
}

async function handleCallTool(request: { params: { name: string; arguments?: unknown } }) {
	switch (request.params.name) {
		case "echo": {
			const parsed = EchoParamsSchema.safeParse(request.params.arguments ?? {});
			if (!parsed.success) {
				throw new McpError(
					ErrorCode.InvalidParams,
					`Invalid arguments for echo: ${parsed.error.message}`,
				);
			}
			const { text, uppercase } = parsed.data;
			const value = uppercase ? text.toUpperCase() : text;
			return {
				content: [
					{
						type: "text",
						text: value,
					},
				],
			};
		}
		default:
			throw new McpError(
				ErrorCode.MethodNotFound,
				`Unknown tool: ${request.params.name}`,
			);
	}
}

describe("Echo Tool", () => {
	it("should list the echo tool", async () => {
		const response = await handleListTools();

		expect(response.tools).toHaveLength(1);
		expect(response.tools[0].name).toBe("echo");
		expect(response.tools[0].description).toBe("Echo back input text");
	});

	it("should echo text without uppercase", async () => {
		const response = await handleCallTool({
			params: {
				name: "echo",
				arguments: { text: "Hello, World!" },
			},
		});

		expect(response.content).toHaveLength(1);
		expect(response.content[0].type).toBe("text");
		expect(response.content[0].text).toBe("Hello, World!");
	});

	it("should echo text with uppercase when requested", async () => {
		const response = await handleCallTool({
			params: {
				name: "echo",
				arguments: { text: "Hello, World!", uppercase: true },
			},
		});

		expect(response.content).toHaveLength(1);
		expect(response.content[0].type).toBe("text");
		expect(response.content[0].text).toBe("HELLO, WORLD!");
	});

	it("should handle uppercase: false explicitly", async () => {
		const response = await handleCallTool({
			params: {
				name: "echo",
				arguments: { text: "Hello, World!", uppercase: false },
			},
		});

		expect(response.content).toHaveLength(1);
		expect(response.content[0].type).toBe("text");
		expect(response.content[0].text).toBe("Hello, World!");
	});

	it("should throw error for missing text parameter", async () => {
		await expect(
			handleCallTool({
				params: {
					name: "echo",
					arguments: {},
				},
			}),
		).rejects.toThrow(McpError);
	});

	it("should throw error for empty text parameter", async () => {
		await expect(
			handleCallTool({
				params: {
					name: "echo",
					arguments: { text: "" },
				},
			}),
		).rejects.toThrow(McpError);
	});

	it("should throw error for unknown tool", async () => {
		await expect(
			handleCallTool({
				params: {
					name: "unknown-tool",
					arguments: {},
				},
			}),
		).rejects.toThrow(McpError);
	});
});

(function (window) {

	function safeEval(code) {
		setRunningTimeout();
		try {
			if (code === "") {
				return;
			} else {
				code = checkCode(code);
				if (code) {
					window.data = {
						eval: undefined,
						safeEval: undefined,
						setInterval: undefined,
						setTimeout: undefined,
						Function: undefined
					};
					eval("with(data){" + code + ";");
					window.data = undefined;	
				}
			}	
		} catch (e) {
			console.error(e);
		}
	}

	// Checks if there is a } bracket that closes the with 
	function checkCode(code) {
		var stack = [];
		var quotes = false;
		for (var i = 0; i < code.length; i++) {
			if (code[i] === "\"") {
				quotes = !quotes;
			} else if (code[i] === "{") {
				stack.push("{");
				if (!quotes) {
					// TODO: Fix obvious flaw
					code = code.slice(0, i + 1) + ";checkTimeout();" + code.slice(i + 1, code.length);
				}
			} else if (code[i] === "{" && stack.pop() === undefined) {
				return false;
			}
		}
		return code;
	}

	var timeout;

	function setRunningTimeout() {
		timeout = new Date();
	}

	function insertTimeout(code) {
		var bracesStack = [];
		for (var i = 0; i < code.length; i++) {
			if (code[i] === "{") {
				bracesStack.push("{");
			} else if (code[i] === "}") {
				bracesStack.push("}");
			}
		}
	}

	function checkTimeout() {
		if (new Date() - timeout > 1000) {
			throw new Error("Breaking out of function due to timeout");
		}
	}


	window.checkTimeout = checkTimeout;
	window.safeEval = safeEval;

	// TODO: Prevent __defineSetter__ and __defineGetter__ from messing around with code

})(window);
var _ = lib.Underscore.require();

//restartProcess('13080');
function restartProcess(name) {
	var process = funcs.processes("SYSTEM");
	var regExp = new RegExp(name);
	_.forEach(process, function (item) {
		var proc = item.toArray()
		if (regExp.test(proc[3])) { 
			//print(proc[3] + ' - ' + proc[5] + ' - ' + system.sysinfo.ServerNetAddress);
			var cmd = './sm -restart:0 -host:' + $.nullsub(proc[7], system.sysinfo.ServerNetAddress) + ' -pid:' + proc[5]; //Linux
      //var cmd = 'sm.exe -restart:0 -host:' + $.nullsub(proc[7], system.sysinfo.ServerNetAddress) + ' -pid:' + proc[5]; //Windows
			print(where + cmd)
			//print('/opt/HPE/ServiceManager9.50/Server/sm.sh -restart:0 -host:' + $.nullsub(proc[5], system.sysinfo.ServerNetAddress) + ' -pid:' + proc[5]);
			return sysExec(cmd);
		}
	});
}

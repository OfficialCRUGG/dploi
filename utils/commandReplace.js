module.exports.replace = (commands, variables) => {
    let commandsToRun = [];
    for (let cmd in commands) {
        if (commands.hasOwnProperty(cmd)) {
            let command = commands[cmd];
            if (command.match(/\${+[0-9]+}/gm)) {
                let cmdNum = command.match(/\${+[0-9]+}/gm)[0].split('${')[1].split('}')[0];
                command = command.replace(/\${+[0-9]+}/gm, variables[cmdNum]);
                commandsToRun.push(command);
            } else {
                commandsToRun.push(command);
            }

        }
    }
    return commandsToRun;
};
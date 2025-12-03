#!/usr/bin/expect -f
set timeout 30
set dump_file [lindex $argv 0]

if {[llength $argv] == 0} {
    puts "Usage: ./transfer_with_expect.sh <dump_file>"
    exit 1
}

spawn scp -o StrictHostKeyChecking=no $dump_file deploy@82.112.253.29:~/
expect {
    "password:" {
        send "0000\r"
        exp_continue
    }
    eof
}
